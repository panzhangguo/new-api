package controller

import (
	"encoding/json"
	"net/http"
	"one-api/model"

	"github.com/gin-gonic/gin"
)

func CreateTeam(c *gin.Context) {

	var team model.WinloadTeam
	err := json.NewDecoder(c.Request.Body).Decode(&team)
	if err != nil || team.Name == "" {
		c.JSON(http.StatusOK, gin.H{
			"message": "无效的参数",
			"success": false,
		})
		return
	}

	data := make(map[string]interface{})

	username, _ := c.Get("username")
	data["username"] = username

	id, _ := c.Get("id")
	data["id"] = id

	c.JSON(http.StatusOK, gin.H{
		"message": "创建团队成功",
		"success": true,
		"data":    data,
	})
}
