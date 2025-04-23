package dto

import "time"

type WinloadTeamUser struct {
	Id                  int       `json:"id"`
	UserId              int       `json:"user_id"`
	TeamId              int       `json:"team_id"`
	Username            string    `json:"username"`
	DisplayName         string    `json:"display_name"`
	UpdatedAt           time.Time `json:"updated_at"`
	CreatedAt           time.Time `json:"created_at"`
	Status              int       `json:"status"`
	IsOwner             bool      `json:"is_owner"`
	Editable            bool      `json:"editable"`              // 人员是否有编辑权限
	JoiningApprovalAble bool      `json:"joining_approval_able"` // 人员是否有审批人员加入权限
	InAuthorizedGroup   bool      `json:"in_authorized_group"`   // 是否在权限组
	ClearTeamuserAble   bool      `json:"clear_teamuser_able"`   // 是否有清除团队成员权限
}

type WinloadTeamForAdmin struct {
	Id          int       `json:"id"`
	Name        string    `json:"name"`
	Username    string    `json:"username"`
	DisplayName string    `json:"display_name"`
	Description string    `json:"description"`
	Avatar      string    `json:"avatar"`
	Code        string    `json:"code"`
	CreatedAt   time.Time `json:"created_at"`
}
type WinloadTeamKeysDto struct {
	Id                 int       `json:"id"`
	KeyId              int       `json:"key_id"`        // key主表的id
	KeyUserId          int       `json:"key_user_id"`   // key的创建者
	KeyApi             string    `json:"key_api"`       // 密钥
	TeamId             int       `json:"team_id"`       // 共享所在团队id
	TeamOwnerId        int       `json:"team_owner_id"` // 团队所有者id
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
	UserId             int       `json:"user_id" gorm:"index"`
	Key                string    `json:"key" gorm:"type:char(48);uniqueIndex"`
	Status             int       `json:"status" gorm:"default:1"`
	Name               string    `json:"name" gorm:"index" `
	CreatedTime        int64     `json:"created_time" gorm:"bigint"`
	AccessedTime       int64     `json:"accessed_time" gorm:"bigint"`
	ExpiredTime        int64     `json:"expired_time" gorm:"bigint;default:-1"` // -1 means never expired
	RemainQuota        int       `json:"remain_quota" gorm:"default:0"`
	UnlimitedQuota     bool      `json:"unlimited_quota" gorm:"default:false"`
	ModelLimitsEnabled bool      `json:"model_limits_enabled" gorm:"default:false"`
	ModelLimits        string    `json:"model_limits" gorm:"type:varchar(1024);default:''"`
	AllowIps           *string   `json:"allow_ips" gorm:"default:''"`
	UsedQuota          int       `json:"used_quota" gorm:"default:0"` // used quota
	Group              string    `json:"group" gorm:"default:''"`
}
