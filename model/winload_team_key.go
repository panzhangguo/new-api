package model

import (
	"errors"
	"one-api/dto"
	"time"

	"gorm.io/gorm"
)

// key_id: selectedApiRecord.id,
// key_user_id: selectedApiRecord.user_id,
// key: selectedApiRecord.key,
// team_id: user2team.team_id,
// team_owner_id: user2team.user_id,
type WinloadTeamKey struct {
	Id          int       `json:"id"`
	KeyId       int       `json:"key_id" validate:"required"`                            // key主表的id
	KeyUserId   int       `json:"key_user_id" validate:"required"`                       // key的创建者
	KeyApi      string    `json:"key_api" validate:"required"`                           // 密钥
	TeamId      int       `json:"team_id" gorm:"index:idx_owner_id" validate:"required"` // 共享所在团队id
	TeamOwnerId int       `json:"team_owner_id"`                                         // 团队所有者id
	CreatedAt   time.Time `json:"created_at" gorm:"bigint;index:idx_created_at_id,priority:2;"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func CheckTeamKeyExistOrDeleted(key string, teamId int) (bool, error) {
	var teamKey WinloadTeamKey
	err := DB.Unscoped().First(&teamKey, "key_api = ? AND team_id = ?", key, teamId).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// not exist, return false, nil
			return false, nil
		}
		// other error, return false, err
		return false, err
	}
	// exist, return true, nil
	return true, nil
}

func (teamKey *WinloadTeamKey) CreateTeamKey() error {
	var err error
	if err = DB.Create(&teamKey).Error; err != nil {
		return err
	}
	return nil
}

// 获取个人所在团队的所有密钥
func GetTeamKeyInTeamIds(teamIds []int) ([]*dto.WinloadTeamKeysDto, error) {
	var teamKeys []*dto.WinloadTeamKeysDto
	query := DB.Model(&WinloadTeamKey{}).Where("team_id IN ?", teamIds)

	query = query.Joins("LEFT JOIN tokens ON winload_team_keys.key_id = tokens.id").
		Where("tokens.deleted_at IS NULL")

	query = query.Select("winload_team_keys.id, winload_team_keys.key_api, winload_team_keys.team_id, winload_team_keys.team_owner_id, winload_team_keys.created_at, tokens.name, tokens.group, tokens.used_quota, tokens.remain_quota, tokens.unlimited_quota, tokens.status, tokens.expired_time")

	err := query.Scan(&teamKeys).Error
	if err != nil {
		return nil, err
	}
	return teamKeys, nil
}

func (teamKey *WinloadTeamKey) TeamKeyDelete() error {
	err := DB.Delete(teamKey).Error
	if err != nil {
		return err
	}
	return nil
}

// func (teamKey *WinloadTeamKey) GetTeamKeyById() (bool, error) {
// 	err := DB.Where("id = ?", teamKey.Id).First(teamKey).Error
// 	if err != nil {
// 		if errors.Is(err, gorm.ErrRecordNotFound) {
// 			return false, nil
// 		}
// 		return false, err
// 	}
// 	return true, nil
// }

func GetTeamKeyById(id int) (*WinloadTeamKey, error) {
	var teamKey *WinloadTeamKey
	err := DB.Unscoped().First(&teamKey, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// not exist, return false, nil
			return nil, nil
		}
		// other error, return false, err
		return nil, err
	}
	// exist, return true, nil
	return teamKey, nil
}
