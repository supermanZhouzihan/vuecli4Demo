<!-- 
 * @description: 主页
 * @fileName: index.vue 
 * @author: zhouzihan 
 * @date: 2023-06-02 15:15:59 
 * @后台人员:  
 * @path:  
 * @version: V1.0.5 
!-->

<template>
  <div>
    <van-nav-bar
      :title="userName"
      left-text="返回"
      left-arrow
      safe-area-inset-top
      @click-left="goBack"

    >
      <!-- <template #right>
        <van-icon name="search" size="18" />
      </template> -->
    </van-nav-bar>

    <!-- <van-nav-bar left-text="返回" left-arrow @click-left="goBack"
      style="margin-bottom: 30px">
      <template #title>
        <div class="cusNavtitle">{{ userName }}</div>
      </template>
    </van-nav-bar> -->

    <van-cell-group style="margin-bottom: 100px">
      <van-cell value="" title-class="cellTitle" value-class="valueTitle">
        <!-- 使用 title 插槽来自定义标题 -->
        <template #title>
          <span class="custom-title">初始化品牌、商品数据</span>
          <van-button
            @click="initLocalGoodsData"
            type="info"
            size="mini"
            style="width: 100px; font-size: 14px"
            >初始化</van-button
          >
        </template>
      </van-cell>

      <van-cell value="" title-class="cellTitle" value-class="valueTitle">
        <template #title>
          <span class="custom-title">待提交数据:{{ noSubmitNumber }}条</span>
          <van-button
            @click="submitOrders"
            type="info"
            size="mini"
            style="width: 100px; font-size: 14px"
            >立即提交</van-button
          >
        </template>
      </van-cell>
    </van-cell-group>

    <!-- <van-cell
      class="mb20"
      title="货位预填入"
      value=""
      title-class="cellTitle"
      value-class="valueTitle"
    />

    <div class="tag">
      <van-badge
        v-for="(item, index) in locationNoList"
        :key="item.locationNo"
        class="vanBadge"
      >
        <div class="child" @click="editLocation(item, index)">
          {{ item.locationNo }}
        </div>
        <template #content>
          <van-icon
            name="cross"
            class="badge-icon"
            @click="delLocation(item, index)"
          />
        </template>
      </van-badge>
      <van-button
        icon="plus"
        type="info"
        class="child customBtn"
        @click="addLocation"
      ></van-button>
    </div> -->

    <van-button
      @click="goInventroy"
      round
      type="primary"
      size="large"
      class="roundBtn"
    >
      盘点
    </van-button>

    <van-button
      @click="goSavedOrder"
      type="primary"
      size="large"
      style="width: 80%"
    >
      远程数据
    </van-button>

    <!-- @confirm="locationDialogConfirm"
      @cancel="locationDialogCancel" -->
    <!-- <van-dialog
      v-model="locationDialogShow"
      :title="locationDialogTitle"
      show-cancel-button
      className="locationDialog"
      :before-close="beforeCloseDialog"
    >
      <div>货位号：<input type="text" v-model="locationForm.locationNo" /></div>
    </van-dialog> -->
  </div>
</template>

<script>
import axios from "axios";
import { initJsStore } from "@/service/idb_service";
// import { StudentService } from "@/service/student_service";
import { GoodsService } from "@/service/goods_service";
import { OrderService } from "@/service/localOrder_service";
export default {
  data() {
    return {
      userName: "",
      locationNoList: [], //货位号数组
      noSubmitNumber: 0,
      locationDialogShow: false,
      locationDialogTitle: "添加货位",
      currentIndex: null,
      locationForm: {
        locationNo: "",
      },
      goodsList: [],
      localOrder: [],
    };
  },
  async beforeCreate() {
    try {
      const isDbCreated = await initJsStore();
      if (isDbCreated) {
        console.log("db created");
        // prefill database
      } else {
        console.log("db opened");
      }
    } catch (ex) {
      console.error(ex);
      alert(ex.message);
      Global.isIndexedDbSupported = false;
    }
  },
  mounted() {
    let userName = localStorage.getItem("userName")
      ? localStorage.getItem("userName")
      : "";
    let goodsListLength = localStorage.getItem("goodsListLength");
    // let localLocationList = localStorage.getItem("localLocationList")
    //   ? JSON.parse(localStorage.getItem("localLocationList"))
    //   : [];

    
    if (userName) {
      this.userName = "工作台：" + userName;
    } else {
      location.href = "/login";
    }
    // this.locationNoList = localLocationList;


    
    this.initLocalOrderData(); //获取本地待提交订单数据
    //初始化商品数据
    if(!goodsListLength){
       this.initLocalGoodsData();
    }
  },
  methods: {
    //初始化商品数据，存在本地数据库
    initLocalGoodsData() {
      this.$toast.loading({
        message: "加载中...",
        forbidClick: true, // 禁止背景点击
        duration: 0, // 持续展示
      });
      let baseUrl = process.env.VUE_APP_BASE_API_PURCHASE;
      let url = baseUrl + "/api/stocktacking/getAllGoods";
      axios
        .get(url)
        .then(async ({ data }) => {
          await new GoodsService().removeAllGoods(); //清除本地数据库所有商品数据
          this.insertGoodsToDb(data.data);
        })
        .catch(() => {
          this.$toast.fail("数据同步失败，请稍后重试");
        });
    },
    async insertGoodsToDb(goods) {
      this.goodsList = await new GoodsService().addMultiGoods(goods);
      localStorage.setItem("goodsListLength",this.goodsList.length);
      this.$toast.success("数据同步完成");
    },
    //提交未提交的盘库数据
    submitOrders() {
      let list = JSON.parse(JSON.stringify(this.localOrder));
      let submitList = [];
      if (list && list.length > 0) {
        list.map((item) => {
          submitList.push({
            goods_id: item.goods_id,
            goods_name: item.goods_name,
            goods_spec: item.goods_spec,
            goods_brand: item.goods_brand,
            pro_date: item.pro_date,
            shelf_life_days: item.shelf_life_days,
            main_unit: item.main_unit,
            main_num: item.main_num,
            sub_unit: item.sub_unit,
            sub_num: item.sub_num,
            stock_location: item.stock_location,
            person: item.person,
          });
        });
      } else {
        this.$toast.fail({
          message: "没有本地数据可提交",
          forbidClick: true, // 禁止背景点击
          duration: 1000, // 持续展示
        });
        return;
      }
      let params = {
        list: submitList,
      };
      let baseUrl = process.env.VUE_APP_BASE_API_PURCHASE;
      let url = baseUrl + "/api/stocktacking/saveRecord";

      this.$toast.loading({
        message: "加载中...",
        forbidClick: true, // 禁止背景点击
        duration: 0, // 持续展示
      });
      axios.post(url, params).then(async () => {
        try{
          await new OrderService().removeAllOrder();
          this.initLocalOrderData();
          this.$toast.success("操作成功");
        }
        catch (err){
          this.$toast.fail("提交失败");
        }
      });
    },
    //初始化订单
    async initLocalOrderData() {
      try {
        let res = await new OrderService().getAllLocalOrderList();
        this.localOrder = res;
        this.noSubmitNumber = res.length;
      } catch (error) {
        this.$toast.fail("本地订单初始化失败");
      }
    },
    //修改货位
    editLocation(item, index) {
      this.locationDialogShow = true;
      this.locationDialogTitle = "编辑货位";
      this.locationForm.locationNo = item.locationNo;
      this.currentIndex = index;
    },
    //添加货位
    addLocation() {
      this.locationDialogShow = true;
      this.currentIndex = null;
      this.locationDialogTitle = "添加货位";
      this.locationForm.locationNo = "";
    },
    //删除货位
    // delLocation(item, index) {
    //   this.$dialog
    //     .alert({
    //       title: "提示",
    //       message: "是否要删除" + item.locationNo + "这条货位数据？",
    //       showCancelButton: true,
    //     })
    //     .then(() => {
    //       this.locationNoList.splice(index, 1);
    //       localStorage.setItem(
    //         "localLocationList",
    //         JSON.stringify(this.locationNoList)
    //       );
    //     })
    //     .catch(() => {});
    // },
    // beforeCloseDialog(action, done) {
    //   if (action == "confirm") {
    //     if (!this.locationForm.locationNo) {
    //       this.$toast("货位号不能为空");
    //       done(false);
    //       return;
    //     }
    //     //编辑
    //     if (this.currentIndex !== null) {
    //       this.locationNoList[this.currentIndex].locationNo =
    //         this.locationForm.locationNo;
    //     }
    //     //新增
    //     else {
    //       this.locationNoList.push({
    //         locationNo: this.locationForm.locationNo,
    //       });
    //     }
    //     localStorage.setItem(
    //       "localLocationList",
    //       JSON.stringify(this.locationNoList)
    //     );
    //   }
    //   done();
    // },
    goBack() {
      this.$router.push({
        name: "Login",
      });
    },
    //去盘点
    goInventroy() {
      // if(!this.locationNoList||this.locationNoList.length==0){
      //   this.$toast("先设置货位号");
      //   return
      // }
      this.$router.push({
        name: "Inventory",
      });
    },
    goSavedOrder() {
      this.$router.push({
        name: "savedOrder",
      });
    },
    //货位点击确定
    // locationDialogConfirm() {
    //   console.log("点击确定");
    // },
    // //货位点击取消
    // locationDialogCancel() {
    //   console.log("点击取消");
    // },
  },
};
</script>

<style lang="scss" scoped>
// .van-nav-bar__content{
//   height: 80px;;
// }
.cellTitle {
  display: flex;
  flex: 8;
  justify-content: space-between;
  .custom-title {
    font-size: 16px;
    text-align: right;
  }
}
.valueTitle {
  flex: 1;
}
.tag {
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
  margin-bottom: 40px;
}
.vanBadge {
  // flex: 1;
  margin: 0 15px 15px 0;
}
// .closeIcon {
//   position: absolute;
//   right: 0;
//   top: 0;
//   transform: translate(60%, -50%);
//   z-index: 2;
// }
.child {
  width: 80px;
  height: 30px;
  line-height: 30px;
  border: 1px solid;
}
.customBtn {
  box-sizing: content-box;
  padding: 0;
}
.badge-icon {
  display: block;
  font-size: 10px;
  line-height: 16px;
}
.van-dialog.locationDialog ::v-deep {
  .van-dialog__header {
    margin-bottom: 30px;
  }
  .van-dialog__content {
    margin-bottom: 30px;
  }
}
.roundBtn {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  font-size: 30px;
  margin-bottom: 60px;
}
</style>