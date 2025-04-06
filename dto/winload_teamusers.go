package dto

import "time"

type WinloadTeamUser struct {
	Username    string    `json:"username"`
	DisplayName string    `json:"display_name"`
	UpdatedAt   time.Time `json:"updated_at"`
	Status      int       `json:"status"`
	IsOwner     bool      `json:"is_owner" gorm:"type:boolean;"`
}
