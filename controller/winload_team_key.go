package controller

import (
	"encoding/json"
	"fmt"
	"net/http"
	"one-api/common"
	"one-api/model"

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
