package model

import (
	"errors"
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
	KeyId       int       `json:"key_id" validate:"required"`
	KeyUserId   int       `json:"key_user_id" validate:"required"`
	KeyApi      string    `json:"key_api" validate:"required"`
	TeamId      int       `json:"team_id" gorm:"index:idx_owner_id" validate:"required"`
	TeamOwnerId int       `json:"team_owner_id"`
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
