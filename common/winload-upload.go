package common

import (
	"os"
	"path/filepath"
	"time"
)

// 定义一个创建文件目录的方法
func Mkdir(basePath string) (string, error) {
	currentDir, err := os.Getwd()

	if err != nil {
		return "", err
	}

	projectRoot := filepath.Dir(currentDir)
	//	1.获取当前时间,并且格式化时间
	folderName := time.Now().Format("20060102")
	folderPath := filepath.Join(projectRoot, basePath, folderName)
	//使用mkdirall会创建多层级目录
	err = os.MkdirAll(folderPath, os.ModePerm)
	if err != nil {
		return "", err // 如果创建失败，返回错误
	}
	return folderPath, nil // 返回成功创建的目录路径
}
