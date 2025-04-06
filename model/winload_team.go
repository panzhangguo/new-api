package model

import (
	"errors"
	"log"
	"one-api/common"
	"one-api/dto"
	"time"
)

type WinloadTeam struct {
	Id          int       `json:"id"`
	Name        string    `json:"name" validate:"required"`                              // 团队名称
	Code        string    `json:"code" validate:"required,contains=wtc,min=32,max=32"`   // 团队码
	Leader      int       `json:"leader" gorm:"index:idx_leader_id" validate:"required"` // 团队负责人id
	Owner       int       `json:"owner" gorm:"index:idx_owner_id" validate:"required"`   // 团队创建人id
	OwnerName   string    `json:"owner_name"`                                            // 团队创建人id
	IsSharedKey bool      `json:"is_shared_key" gorm:"type:boolean;"`                    // 是否共享密钥
	Avatar      string    `json:"avatar"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at" gorm:"bigint;index:idx_created_at_id,priority:2;"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type WinloadUserTeam struct {
	Id        int         `json:"id"`
	UserId    int         `json:"user_id" gorm:"index:idx_user_id_team_id primaryKey"`
	TeamId    int         `json:"team_id" gorm:"index:idx_user_id_team_id primaryKey"`
	IsOwner   bool        `json:"is_owner" gorm:"type:boolean;"`
	Status    int         `json:"status" gorm:"type:int;"` // 人员的状态 User2TeamStatus
	Team      WinloadTeam `json:"team" gorm:"references:Id;foreignKey:TeamId;"`
	CreatedAt time.Time   `json:"created_at"`
	UpdatedAt time.Time   `json:"updated_at"`
}

const (
	TeamPrefix      = "TEAM_" // 团队码前缀
	TeamCodeLength  = 8       // 团队码长度
	MaxRetryAttempt = 3       // 最大重试次数
)

// generateUniqueTeamCode 生成唯一的团队码
func generateUniqueTeamCode() (string, error) {
	attempt := 0
	for attempt < MaxRetryAttempt {
		code := TeamPrefix + common.GetRandomString(TeamCodeLength)
		// 检查团队码是否已存在
		var count int64
		if err := DB.Model(&WinloadTeam{}).Where("code = ?", code).Count(&count).Error; err != nil {
			return "", err
		}
		if count == 0 {
			return code, nil
		}
		attempt++
	}
	return "", errors.New("failed to generate unique team code after multiple attempts")
}

func (team *WinloadTeam) Insert() error {
	// 创建团队码
	// 人员注册时可以通过此码直接加入团队
	code, err := generateUniqueTeamCode()
	if err != nil {
		return err
	}
	team.Code = code

	tx := DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Panic occurred: %v, rolling back transaction", r)
			tx.Rollback()
		}
	}()

	// 插入团队信息
	if err := tx.Create(team).Error; err != nil {
		tx.Rollback()
		return err
	}

	// 插入用户-团队关系
	relation := WinloadUserTeam{
		UserId:  team.Owner,
		TeamId:  team.Id,
		IsOwner: true,
		Status:  common.User2TeamStatus["Owner"],
	}
	if err := tx.Create(&relation).Error; err != nil {
		tx.Rollback()
		return err
	}
	// 提交事务
	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}

func (team *WinloadTeam) GetSelfTeam(userId int) (*WinloadTeam, error) {
	team = &WinloadTeam{}

	// db.Where("哦 = ?", "tizi365").First(&user)
	result := DB.Where("Owner = ?", userId).First(team)
	if result.Error != nil {
		return nil, result.Error
	}
	return team, nil
}

func GetTeamsByUserId(userId int) ([]WinloadUserTeam, error) {
	var user2teams []WinloadUserTeam
	err := DB.Model(&WinloadUserTeam{}).Where("user_id = ?", userId).Preload("Team").Find(&user2teams).Error

	//user2teams[0].Team.Owner // 获取创建人
	var teamOwners = []int{}
	// 将user2teams中的Team.Owner添加到teamOwners中
	for _, user := range user2teams {
		teamOwners = append(teamOwners, user.Team.Owner)
	}
	// 通过teamOwners查询用户表
	var owners []User
	if err := DB.Where("id IN ?", teamOwners).Find(&owners).Error; err != nil {
		return nil, err
	}
	// 将user2teams的team的OwnerName设置为查询到的用户表的DisplayName
	for i, user := range user2teams {
		for _, owner := range owners {
			if user.Team.Owner == owner.Id {
				user2teams[i].Team.OwnerName = owner.DisplayName + "/" + owner.Username
				break
			}
		}
	}
	return user2teams, err
}

func UpdateTeamCode(team *WinloadTeam) (code string, error error) {
	code, err := generateUniqueTeamCode()
	if err != nil {
		return "", err
	}

	res := DB.Model(&WinloadTeam{}).Where("Id = ?", team.Id).Update("Code", code)
	if res.Error != nil {
		return "", res.Error
	}
	return code, nil
}

func (team *WinloadTeam) UpdateTeam(teamId int) error {

	var err error

	newTeam := *team
	updates := map[string]interface{}{
		"name":          newTeam.Name,
		"is_shared_key": newTeam.IsSharedKey,
		"avatar":        newTeam.Avatar,
		"description":   newTeam.Description,
	}

	DB.First(&team, teamId)
	if err = DB.Model(&team).Updates(updates).Error; err != nil {
		return err
	}
	// res := DB.Model(&WinloadTeam{}).Where("Id = ?", team.Id).Updates(updates)
	// if res.Error != nil {
	// 	return res.Error
	// }
	return nil
}

func GetTeamByCode(code string) (*WinloadTeam, error) {
	// 通过code查找团队
	team := WinloadTeam{Code: code}
	var err error = nil
	err = DB.First(&team, "code = ?", code).Error

	return &team, err
}

func JoinTeamByCode(code string, userId int) error {
	var err error = nil
	team := WinloadTeam{Code: code}
	err = DB.First(&team, "code = ?", code).Error
	if err != nil {
		return err
	}
	// 判断用户是否已经在团队中
	var count int64
	if err = DB.Model(&WinloadUserTeam{}).Where("user_id = ? and team_id = ?", userId, team.Id).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return errors.New("用户已经加入团队")
	}
	// user2steam := DB.First(&WinloadUserTeam{}, "user_id = ? and code = ?", userId, code)

	// 插入用户-团队关系
	cleanUser2team := WinloadUserTeam{
		UserId:  userId,
		TeamId:  team.Id,
		IsOwner: false,
		Status:  common.User2TeamStatus["joining"],
	}

	if err = DB.Create(&cleanUser2team).Error; err != nil {
		return err
	}
	return nil
}

func SearchTeamUsers(keyword string, teamId int, startIdx int, num int) ([]*dto.WinloadTeamUser, int64, error) {
	// var users []*User
	var teamUsers []*dto.WinloadTeamUser
	var total int64
	var err error

	// 开始事务
	tx := DB.Begin()
	if tx.Error != nil {
		return nil, 0, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 构建基础查询
	query := tx.Unscoped().Model(&WinloadUserTeam{})
	query = query.Where("winload_user_teams.team_id = (?)", teamId)

	// 获取总数
	err = query.Count(&total).Error
	if err != nil {
		tx.Rollback()
		return nil, 0, err
	}
	likeKeyword := "%" + keyword + "%"
	query.Select("users.username, users.display_name, winload_user_teams.status, winload_user_teams.is_owner, winload_user_teams.updated_at").
		Joins("left join users on winload_user_teams.user_id = users.id")
	query = query.Where("users.username LIKE ? OR users.email LIKE ? OR users.display_name LIKE ?", likeKeyword, likeKeyword, likeKeyword)

	// 获取分页数据
	err = query.Omit("password").
		Order("winload_user_teams.updated_at desc").
		Limit(num).
		Offset(startIdx).
		Scan(&teamUsers).Error
	if err != nil {
		tx.Rollback()
		return nil, 0, err
	}

	// 提交事务
	if err = tx.Commit().Error; err != nil {
		return nil, 0, err
	}

	return teamUsers, total, nil
}
