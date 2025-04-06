package controller

import (
	"encoding/json"
	"fmt"
	"net/http"
	"one-api/common"
	"one-api/model"
	"os"
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
)

func CreateTeam(c *gin.Context) {
	var team model.WinloadTeam

	existingTeam, _ := team.GetSelfTeam(c.GetInt("id"))
	if existingTeam != nil {
		c.JSON(http.StatusOK, gin.H{
			"message": "您已经创建了自己的团队，请勿重复创建",
			"success": false,
		})
		return
	}

	err := json.NewDecoder(c.Request.Body).Decode(&team)
	if err != nil || team.Name == "" {
		c.JSON(http.StatusOK, gin.H{
			"message": "无效的参数",
			"success": false,
		})
		return
	}

	id, _ := c.Get("id")
	team.Leader = id.(int)
	team.Owner = id.(int)
	if err := team.Insert(); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "创建我的团队成功",
	})
}

func UploadTeamAvatar(c *gin.Context) {
	var userId = c.GetInt("id")
	path, err := common.Mkdir(fmt.Sprintf("/upload/%d/avatar", userId))

	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "上传头像失败" + err.Error(),
		})
	}

	file, err := c.FormFile("file")

	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "上传头像失败" + err.Error(),
		})
		return
	}

	savePath := filepath.Join(path, "/", file.Filename)
	// c.SaveUploadedFile(file, savePath)
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "保存文件失败: " + err.Error(),
		})
		return
	}

	currentDir, _ := os.Getwd()
	projectRoot := filepath.Dir(currentDir)
	relativePath, _ := filepath.Rel(projectRoot, savePath)

	url := "/" + filepath.ToSlash(relativePath)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "上传头像成功",
		"data":    url,
	})
}

func GetSelfTeams(c *gin.Context) {
	teams, err := model.GetTeamsByUserId(c.GetInt("id"))

	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "获取用户信息失败" + err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "获取用户信息成功",
		"data":    teams,
	})
}

func UpdateTeamCode(c *gin.Context) {
	var team model.WinloadTeam

	err := json.NewDecoder(c.Request.Body).Decode(&team)
	if err != nil || team.Name == "" {
		c.JSON(http.StatusOK, gin.H{
			"message": "无效的参数",
			"success": false,
		})
		return
	}

	code, err := model.UpdateTeamCode(&team)

	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "新的团队码",
		"data":    code,
	})
}

func UpdateTeam(c *gin.Context) {
	var team model.WinloadTeam
	err := json.NewDecoder(c.Request.Body).Decode(&team)
	if err != nil || team.Name == "" {
		c.JSON(http.StatusOK, gin.H{
			"message": "无效的参数",
			"success": false,
		})
		return
	}

	cleanTeam := model.WinloadTeam{
		IsSharedKey: team.IsSharedKey,
		Name:        team.Name,
		Description: team.Description,
		Avatar:      team.Avatar,
	}

	err = cleanTeam.UpdateTeam(team.Id)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "更新团队信息成功",
	})
}

func GetTeamByCode(c *gin.Context) {
	code := c.Param("code") // 获取路径参数 :code 的值
	if code == "" {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的团队码",
		})
		return
	}
	team, err := model.GetTeamByCode(code)

	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "获取团队信息失败" + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "获取团队信息成功",
		"data":    team,
	})
}

func JoinTeam(c *gin.Context) {
	userId := c.GetInt("id")
	err := model.JoinTeamByCode(c.Param("code"), userId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "申请团队成功，请等待审核通过",
	})
}

func SearchTeamUsers(c *gin.Context) {
	keyword := c.Query("keyword")
	teamId, _ := strconv.Atoi(c.Query("team_id"))
	p, _ := strconv.Atoi(c.Query("p"))
	pageSize, _ := strconv.Atoi(c.Query("page_size"))
	if p < 1 {
		p = 1
	}
	if pageSize < 0 {
		pageSize = common.ItemsPerPage
	}
	startIdx := (p - 1) * pageSize
	users, total, err := model.SearchTeamUsers(keyword, teamId, startIdx, pageSize)
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
		"data": gin.H{
			"items":     users,
			"total":     total,
			"page":      p,
			"page_size": pageSize,
		},
	})
}
