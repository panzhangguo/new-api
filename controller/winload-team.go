package controller

import (
	"encoding/json"
	"fmt"
	"net/http"
	"one-api/common"
	"one-api/dto"
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
	path, err := common.Mkdir(fmt.Sprintf("/upload/%d/team/avatar", userId))

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
	// 判断用户是否有更新权限
	user2steam, _ := model.GetUser2TeamByUserId(c.GetInt("id"), team.Id)
	if !user2steam.IsOwner && !user2steam.Editable {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "您没有更新团队信息的权限",
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
	// 判断用户是否有更新权限
	user2steam, _ := model.GetUser2TeamByUserId(c.GetInt("id"), team.Id)
	if !user2steam.IsOwner && !user2steam.Editable {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "您没有更新团队信息的权限",
		})
		return
	}

	cleanTeam := model.WinloadTeam{
		IsSharedKey:     team.IsSharedKey,
		JoiningApproval: team.JoiningApproval,
		Name:            team.Name,
		Description:     team.Description,
		Avatar:          team.Avatar,
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

func GetTeamById(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id")) // 获取路径参数 :id 的值
	team, err := model.GetTeamById(id)
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
	status, _ := strconv.Atoi(c.Query("status"))
	if p < 1 {
		p = 1
	}
	if pageSize < 0 {
		pageSize = common.ItemsPerPage
	}
	startIdx := (p - 1) * pageSize
	users, total, err := model.SearchTeamUsers(keyword, status, teamId, startIdx, pageSize)
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

func GetAllTeamUsersByTeamId(c *gin.Context) {
	teamId, _ := strconv.Atoi(c.Param("team_id"))

	users, total, err := model.GetAllTeamUsersByTeamId(teamId)
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
			"items": users,
			"total": total,
		},
	})
}

func GetTeamsForAdmin(c *gin.Context) {
	teams, total, err := model.GetTeamsForAdmin()
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
			"items": teams,
			"total": total,
		},
	})
}

// 更新用户-团队权限
func UpdateUser2TeamAuth(c *gin.Context) {
	var user2team *dto.WinloadTeamUser
	err := json.NewDecoder(c.Request.Body).Decode(&user2team)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的参数",
		})
		return
	}

	// 判断用户是否有赋予权限的权限
	handlerUser2steam, _ := model.GetUser2TeamByUserId(c.GetInt("id"), user2team.TeamId)
	if !handlerUser2steam.IsOwner {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "您没有赋予权限的权限",
		})
		return
	}

	cleanUser2team := model.WinloadUserTeam{
		JoiningApprovalAble: user2team.JoiningApprovalAble,
		Editable:            user2team.Editable,
		InAuthorizedGroup:   user2team.InAuthorizedGroup,
		ClearTeamuserAble:   user2team.ClearTeamuserAble,
	}
	err = cleanUser2team.UpdateUser2TeamAuth(user2team.Id)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "用户权限更新成功",
	})
}

// 更新用户-团队-状态
func UpdateUser2TeamStatus(c *gin.Context) {
	// 如果status为-1 则表示删除用户
	var user2team *dto.WinloadTeamUser
	err := json.NewDecoder(c.Request.Body).Decode(&user2team)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的参数",
		})
		return
	}

	// 判断用户是否有赋予权限的权限
	handlerUser2steam, _ := model.GetUser2TeamByUserId(c.GetInt("id"), user2team.TeamId)
	if user2team.Status == common.User2TeamStatus["member"] && !handlerUser2steam.JoiningApprovalAble {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "您没有赋予权限的权限",
		})
		return
	}

	if user2team.Status == common.User2TeamStatus["cleared"] && !handlerUser2steam.ClearTeamuserAble {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "您没有赋予权限的权限",
		})
		return
	}

	memberUser2team := model.WinloadUserTeam{
		Status: user2team.Status,
		UserId: user2team.UserId,
		TeamId: user2team.TeamId,
	}
	err = memberUser2team.UpdateUser2TeamStatus(user2team.Id)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "用户信息更新成功",
	})
}

// 更新用户-团队-权限组
func UpdateUser2TeamInAuthorizedGroup(c *gin.Context) {
	inAuthorizedGroup, _ := strconv.Atoi(c.Param("in_authorized_group"))
	var user2teams []*dto.WinloadTeamUser
	err := json.NewDecoder(c.Request.Body).Decode(&user2teams)

	if (inAuthorizedGroup != 0 && inAuthorizedGroup != 1) || err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的参数",
		})
		return
	}

	err = model.UpdateUser2TeamInAuthorizedGroup(user2teams, inAuthorizedGroup == 1)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "用户组权限更新成功",
	})
}

func GetTeamAuthorizedGroupUsers(c *gin.Context) {
	teamId, err := strconv.Atoi(c.Param("team_id"))
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的参数",
		})
		return
	}
	users, err := model.GetTeamAuthorizedGroupUsers(teamId)
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
		"data":    users,
	})
}
