package model

import "gorm.io/gorm"

type AcfxKnowledgeSetting struct {
	Id               int            `json:"id"`
	Username         string         `json:"username" gorm:"unique;index" validate:"max=12"`
	Password         string         `json:"password" gorm:"not null;" validate:"min=8,max=20"`
	DisplayName      string         `json:"display_name" gorm:"index" validate:"max=20"`
	MobilePhone      string         `json:"mobile_phone" gorm:"type:varchar(11);" validate:"max=11"` // pfee 添加手机号码
	Role             int            `json:"role" gorm:"type:int;default:1"`                          // admin, common
	Status           int            `json:"status" gorm:"type:int;default:1"`                        // enabled, disabled
	Email            string         `json:"email" gorm:"index" validate:"max=50"`
	GitHubId         string         `json:"github_id" gorm:"column:github_id;index"`
	OidcId           string         `json:"oidc_id" gorm:"column:oidc_id;index"`
	WeChatId         string         `json:"wechat_id" gorm:"column:wechat_id;index"`
	TelegramId       string         `json:"telegram_id" gorm:"column:telegram_id;index"`
	VerificationCode string         `json:"verification_code" gorm:"-:all"`                                    // this field is only for Email verification, don't save it to database!
	AccessToken      *string        `json:"access_token" gorm:"type:char(32);column:access_token;uniqueIndex"` // this token is for system management
	Quota            int            `json:"quota" gorm:"type:int;default:0"`
	UsedQuota        int            `json:"used_quota" gorm:"type:int;default:0;column:used_quota"` // used quota
	RequestCount     int            `json:"request_count" gorm:"type:int;default:0;"`               // request number
	Group            string         `json:"group" gorm:"type:varchar(64);default:'default'"`
	InviterId        int            `json:"inviter_id" gorm:"type:int;column:inviter_id;index"`
	DeletedAt        gorm.DeletedAt `gorm:"index"`
	LinuxDOId        string         `json:"linux_do_id" gorm:"column:linux_do_id;index"`
	Setting          string         `json:"setting" gorm:"type:text;column:setting"`
}
