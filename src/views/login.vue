<!-- 
 * @description: 登录页
 * @fileName: login.vue 
 * @author: zhouzihan 
 * @date: 2023-06-02 13:18:13 
 * @后台人员:  
 * @path:  
 * @version: V1.0.5 
!-->

<template>
  <div class="container">
    <h3>盘 库</h3>
    <van-divider style="padding: 0 60px"> </van-divider>
    <div style="width: 40%; margin: 0 auto">
      <div class="text-left mb20">单位 ： {{ companyName }}</div>
      <div class="text-left">日期 ： {{ currentDate }}</div>
    </div>
    <van-divider style="padding: 0 60px; margin-bottom: 50px"> </van-divider>
    <div style="margin-bottom: 50px">
      姓名：<input type="text" v-model="userName" style="height:30px" />
    </div>
    <div></div>
    <van-button type="primary" size="large" style="width: 80%" @click="login"
      >进入工作台</van-button
    >
  </div>
</template>

<script>
export default {
  data() {
    return {
      text: 1,
      companyName: "四川天宇",
      currentDate: this.$formatDate.nowFormat("YYYY-MM-DD"),
      userName: "",
    };
  },
  mounted() {
    this.userName=localStorage.getItem("userName")
  },
  methods: {
    login() {
      if (!this.userName) {
        this.$dialog.alert({
          title:"提示",
          message: "请输入姓名",
        });
        return
      }
      localStorage.setItem('userName',this.userName);
      this.$router.push({
        name:'Index'
      })
    },
  },
};
</script>

<style lang="scss" scoped>
</style>