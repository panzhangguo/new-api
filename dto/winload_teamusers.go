package dto

import "time"

type WinloadTeamUser struct {
	Id                  int       `json:"id"`
	UserId              int       `json:"user_id"`
	TeamId              int       `json:"team_id"`
	Username            string    `json:"username"`
	DisplayName         string    `json:"display_name"`
	UpdatedAt           time.Time `json:"updated_at"`
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
