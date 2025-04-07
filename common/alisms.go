package common

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strings"

	openapi "github.com/alibabacloud-go/darabonba-openapi/v2/client"
	dysmsapi20170525 "github.com/alibabacloud-go/dysmsapi-20170525/v4/client"
	util "github.com/alibabacloud-go/tea-utils/v2/service"
	"github.com/alibabacloud-go/tea/tea"
)

// Description:
//
// 使用AK&SK初始化账号Client
//
// @return Client
//
// @throws Exception

// ALIBABA_CLOUD_ACCESS_KEY_ID=LTAI5tP4XjHoBHQ9A6G4qy5k
// ALIBABA_CLOUD_ACCESS_KEY_SECRET=v0yDqx3CefMJigsDVCYUP2khb27Mje
// ALIBABA_DYSMS_SIGNNAME=奥晨分享智能科技
// ALIBABA_DYSMS_TEMPLATECODE=SMS_314796303

func CreateClient() (_result *dysmsapi20170525.Client, _err error) {
	// 工程代码泄露可能会导致 AccessKey 泄露，并威胁账号下所有资源的安全性。以下代码示例仅供参考。
	// 建议使用更安全的 STS 方式，更多鉴权访问方式请参见：https://help.aliyun.com/document_detail/378661.html。
	config := &openapi.Config{
		// 必填，请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_ID。
		AccessKeyId: tea.String(os.Getenv("ALIBABA_CLOUD_ACCESS_KEY_ID")),
		// 必填，请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_SECRET。
		AccessKeySecret: tea.String(os.Getenv("ALIBABA_CLOUD_ACCESS_KEY_SECRET")),
	}
	config.RegionId = tea.String("cn-hangzhou")
	// Endpoint 请参考 https://api.aliyun.com/product/Dysmsapi
	config.Endpoint = tea.String("dysmsapi.aliyuncs.com")
	_result = &dysmsapi20170525.Client{}
	_result, _err = dysmsapi20170525.NewClient(config)
	return _result, _err
}

func SendDySmsCode(phone string, code string) (_err error) {
	client, _err := CreateClient()
	if _err != nil {
		return _err
	}

	templateCode := os.Getenv("ALIBABA_DYSMS_TEMPLATECODE")
	signName := os.Getenv("ALIBABA_DYSMS_SIGNNAME")

	sendSmsRequest := &dysmsapi20170525.SendSmsRequest{
		PhoneNumbers: tea.String(phone),
		SignName:     tea.String(signName),
		TemplateCode: tea.String(templateCode),
		// TemplateParam: tea.String("{\"code\":\"" + code + "\"}"),
		TemplateParam: tea.String("{\"code\":\"1234\"}"),
	}
	runtime := &util.RuntimeOptions{}
	tryErr := func() (_e error) {
		defer func() {
			if r := tea.Recover(recover()); r != nil {
				_e = r
			}
		}()
		// 复制代码运行请自行打印 API 的返回值
		_result, _err := client.SendSmsWithOptions(sendSmsRequest, runtime)
		if _err != nil {
			return _err
		}

		// 检查 Result.Body.Code 是否存在错误
		if _result.Body.Code != nil && *(_result.Body.Code) != "OK" {
			// 确保 Message 不为 nil，避免空指针异常
			if _result.Body.Message != nil {
				return errors.New(*_result.Body.Message)
			}
			return errors.New("unknown error from SMS service")
		}

		return nil
	}()

	if tryErr != nil {
		var error = &tea.SDKError{}
		if _t, ok := tryErr.(*tea.SDKError); ok {
			error = _t
		} else {
			error.Message = tea.String(tryErr.Error())
		}
		// 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
		// 错误 message
		fmt.Println("error message" + tea.StringValue(error.Message))
		// 诊断地址
		var data interface{}
		d := json.NewDecoder(strings.NewReader(tea.StringValue(error.Data)))
		d.Decode(&data)
		if m, ok := data.(map[string]interface{}); ok {
			recommend, _ := m["Recommend"]
			fmt.Println(recommend)
		}
		_, _err = util.AssertAsString(error.Message)

		if _err != nil {
			return _err
		}

		return error
	}
	return _err
}

// func main() {
// 	err := _main(tea.StringSlice(os.Args[1:]))
// 	if err != nil {
// 		panic(err)
// 	}
// }
