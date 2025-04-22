package controller

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"one-api/common"
	"regexp"
	"time"

	"github.com/gin-gonic/gin"
)

func isValidMobile(mobile string) bool {
	regex := `^1[3-9]\d{9}$`
	matched, err := regexp.MatchString(regex, mobile)
	if err != nil {
		return false
	}
	return matched
}

func GenerateSmsCode(length int) string {
	source := rand.NewSource(time.Now().UnixNano())
	rng := rand.New(source) // 使用本地随机数生成器
	code := make([]byte, length)
	for i := range code {
		code[i] = byte(rng.Intn(10) + '0')
	}
	return string(code)
}

func SendSmsCode(c *gin.Context) {
	phone := c.Query("mobile_phone")
	sms_mode := c.Query("sms_mode")

	if sms_mode != common.SmsEnum["LOGIN"] &&
		sms_mode != common.SmsEnum["REGISTER"] &&
		sms_mode != common.SmsEnum["FORGET_PASSWORD"] {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的短信验证码类型",
		})
		return
	}

	if !isValidMobile(phone) {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "请输入有效手机号码",
		})

		return
	}

	sendedSmsCode, err := common.RedisGet(sms_mode + phone)
	if err != nil && err.Error() != "redis: nil" {
		err = fmt.Errorf("failed to get smscode: %w", err) // 保留错误链信息
		log.Printf("Error occurred: %v", err)
	}

	if sendedSmsCode != "" {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "请勿重复发送验证码，或稍后重试",
		})
		return
	}

	smsCode := GenerateSmsCode(6)

	dyerr := common.SendDySmsCode(phone, smsCode)

	if dyerr != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "短信验证码发送失败，请稍后重试",
			"data":    dyerr,
		})
		return
	}
	// 60s内有效
	common.RedisSet(sms_mode+phone, smsCode, time.Second*60)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "已生成验证码",
		"data":    smsCode,
	})

}

/*
0 错误/过期/未发送
1 验证码错误
2 验证成功
*/
func ValidateSmsCode(phone string, code string) int {
	smscode, err := common.RedisGet(phone)
	if err != nil && err.Error() != "redis: nil" || smscode == "" {
		// 错误 // 过期
		return 0
	}

	if smscode != "" && smscode != code {
		// 错误
		return 1
	}

	return 2
}

// 客户端注册
func StudioRegister(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "用户注册,欢迎使用！",
		"success": true,
	})
}
