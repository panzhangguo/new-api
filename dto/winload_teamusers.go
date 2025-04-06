package dto

import "time"

type WinloadTeamUser struct {
	Username    string    `json:"username"`
	DisplayName string    `json:"display_name"`
	UpdatedAt   time.Time `json:"updated_at"`
	Status      int       `json:"status"`
	IsOwner     bool      `json:"is_owner" gorm:"type:boolean;"`
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
