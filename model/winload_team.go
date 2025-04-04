package model

import "one-api/common"

type WinloadTeam struct {
	Id          int    `json:"id"`
	Name        string `json:"name" validate:"required"`                              // 团队名称
	Code        string `json:"code" validate:"required,contains=wtc,min=32,max=32"`   // 团队码
	Leader      int    `json:"leader" gorm:"index:idx_leader_id" validate:"required"` // 团队负责人id
	Description string `json:"description"`
	CreatedAt   int64  `json:"created_at" gorm:"bigint;index:idx_created_at_id,priority:2;"`
	UpdatedAt   int64  `json:"updated_at"`
}

func Insert(team *WinloadTeam) error {
	code := common.TeamPrefix + common.GetRandomString(common.TeamCodeLength)
	team.Code = code

	result := DB.Create(team)
	if result.Error != nil {
		return result.Error
	}

	return nil
}
