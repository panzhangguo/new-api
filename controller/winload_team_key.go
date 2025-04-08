package controller

import (
	"encoding/json"
	"fmt"
	"net/http"
	"one-api/common"
	"one-api/dto"
	"one-api/model"
	"strconv"

	"github.com/gin-gonic/gin"
)

func CreateTeamKey(c *gin.Context) {

	var teamKey model.WinloadTeamKey
	err := json.NewDecoder(c.Request.Body).Decode(&teamKey)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的参数",
		})
		return
	}
	if err := common.Validate.Struct(&teamKey); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "输入不合法 " + err.Error(),
		})
		return
	}

	exist, err := model.CheckTeamKeyExistOrDeleted(teamKey.KeyApi, teamKey.TeamId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "数据库错误，请稍后重试",
		})
		common.SysError(fmt.Sprintf("CheckTeamKeyExistOrDeleted error: %v", err))
		return
	}
	if exist {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "密钥已在团队中使用，请换一个",
		})
		return
	}

	cleanTemKey := model.WinloadTeamKey{
		KeyId:       teamKey.KeyId,
		KeyUserId:   teamKey.KeyUserId,
		KeyApi:      teamKey.KeyApi,
		TeamId:      teamKey.TeamId,
		TeamOwnerId: teamKey.TeamOwnerId,
	}

	if err := cleanTemKey.CreateTeamKey(); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
	})

}

type TeamKeyResult struct {
	Team model.WinloadTeam         `json:"team"`
	Keys []*dto.WinloadTeamKeysDto `json:"keys"`
}

func GetMyUsefulTeamKeys(c *gin.Context) {
	userId := c.GetInt("id")
	user2teams, err := model.GetTeamsByUserId(userId, false)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "查询用户所属团队出错" + err.Error(),
		})
		return
	}
	var teamIds []int
	for _, user2team := range user2teams {
		teamIds = append(teamIds, user2team.TeamId)
	}
	teamKeys, err := model.GetTeamKeyInTeamIds(teamIds)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "查询用户可用团队密钥错误" + err.Error(),
		})
		return
	}

	// 创建一个临时映射来存储团队ID与密钥的关系
	teamKeyMap := make(map[int][]*dto.WinloadTeamKeysDto)
	for _, teamKey := range teamKeys {
		teamKeyMap[teamKey.TeamId] = append(teamKeyMap[teamKey.TeamId], teamKey)
	}

	result := []TeamKeyResult{}

	for _, user2team := range user2teams {
		teamKeys = teamKeyMap[user2team.TeamId]
		if len(teamKeys) == 0 {
			continue
		}
		result = append(result, TeamKeyResult{
			Team: user2team.Team,
			Keys: teamKeyMap[user2team.TeamId],
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "获取团队密钥",
		"data":    result,
	})
}

func DeleteTeamKeyById(c *gin.Context) {
	deleteUserid := c.GetInt("id")
	id, _ := strconv.Atoi(c.Param("id"))
	var teamKey *model.WinloadTeamKey
	// 用户为自己才能移除密钥
	// 管理员也可以
	teamKey, err := model.GetTeamKeyById(id)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "数据库错误，请稍后重试",
		})
		common.SysError(fmt.Sprintf("CheckTeamKeyExistOrDeleted error: %v", err))
		return
	}

	if teamKey == nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "密钥不存在",
		})
		return
	}

	if deleteUserid != teamKey.KeyUserId && !model.IsAdmin(deleteUserid) {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "不要删除他人的密钥",
		})
		return
	}

	err = teamKey.TeamKeyDelete()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
	})
}
