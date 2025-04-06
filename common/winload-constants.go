package common

var TeamPrefix = "tc"
var TeamCodeLength = 30

var User2TeamStatus = map[string]int{
	"owner":   1, // 团队所有者
	"member":  2, // 正式成员
	"joining": 3, // 加入中。。待审核
}
