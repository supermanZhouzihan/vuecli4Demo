<!-- 
 * @description: 已保存订单/远程服务器订单
 * @fileName: savedOrder.vue 
 * @author: zhozihan 
 * @date: 2023-06-02 19:11:19 
 * @后台人员:  
 * @path:  
 * @version: V1.0.5 
!-->

<template>
  <div>
    <van-nav-bar
      :title="'工作台：' + userName"
      left-text="返回"
      left-arrow
      safe-area-inset-top
      @click-left="goBack"
      style="margin-bottom: 10px"
    >
    </van-nav-bar>
    <div style="margin-bottom:10px">远程订单数据</div>
    <van-sticky>
    <div style="display: flex; align-items: center; padding: 0 5px">
      <van-field
        v-model="orderParams.keyword"
        center
        clearable
        label="关键字"
        placeholder="按商品、货位搜索"
        size="large"
        class="customSearchInput"
      >
      </van-field>
      <van-button
        size="large"
        type="primary"
        style="width: 100px"
        @click="onSearchOrderList"
        >搜索</van-button
      >
    </div>
    </van-sticky>

    <van-list
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="listOnLoad"
    >
      <van-swipe-cell
        v-for="item in orders"
        :key="item.id"
        :before-close="beforeClose"
        :name="item.id"
      >
        <div @click="clickItem(item)" class="listItem">
          <div class="listIntroItem">
            {{ item.goods_brand ? "【" + item.goods_brand + "】" : "" }}
            {{ item.goods_name }} （{{ item.goods_spec }}）
          </div>
          <div class="listIntroItem introText">
            货位:{{ item.stock_location }}，生产日期：{{
              item.pro_date
            }}，有效期：{{ item.shelf_life_days }}天
          </div>
          <div class="listIntroItem introText">
            数量：整{{ item.main_num }}{{ item.main_unit }},零{{ item.sub_num
            }}{{ item.sub_unit }}
          </div>
          <div class="listIntroItem introText">
            操作人：{{item.person}}，{{item.update_time}}
          </div>
        </div>

        <template #right>
          <van-button
            square
            text="删除"
            type="danger"
            id="删除"
            class="delete-button"
          />
        </template>
      </van-swipe-cell>
    </van-list>

    <!-- 添加、编辑商品弹窗 -->
    <van-action-sheet
      v-model="dialogShow"
      :title="formTitle"
      :close-on-click-overlay="false"
    >
      <div class="content">
        <van-form @submit="onSubmit">
            <van-field
            v-model="form.stock_location"
            name="stock_location"
            placeholder="货位"
            required
            label="货位"
            :rules="[{ required: true, message: '请输入货位' }]"
          />
          <van-field
            v-model="form.goods_name"
            @focus="openSearchGoodsListDialog"
            name="goods_name"
            placeholder="商品名称"
            label="商品"
            required
            readonly
            :rules="[{ required: true, message: '请选择商品' }]"
          />
          <van-field
            v-model="form.goods_spec"
            name="goods_spec"
            placeholder="规格"
            label="规格"
            readonly
          />
          <van-field
            v-model="form.goods_brand"
            name="goods_brand"
            placeholder="品牌"
            label="品牌"
            readonly
          />
          <van-cell value="" class="customCell">
            <template #title>
              <span class="custom-title">数量</span>
              <div>
                <van-field
                  v-model="form.main_num"
                  name="main_num"
                  placeholder="主单位"
                  required
                  label="整"
                  :rules="[{ validator: numReg, message: '请输入正确的数量' }]"
                >
                  <template #extra>
                    <span>{{ form.main_unit }}</span>
                  </template>
                </van-field>
                <van-field
                  v-model="form.sub_num"
                  name="sub_num"
                  placeholder="辅单位"
                  label="零"
                  :rules="[
                    { validator: subUnitnumReg, message: '请输入正确的数量' },
                  ]"
                >
                  <template #extra>
                    <span>{{ form.sub_unit ? form.sub_unit : "--" }}</span>
                  </template>
                </van-field>
              </div>
              <!-- <van-tag type="danger">标签</van-tag> -->
            </template>
          </van-cell>
          <van-field
            v-model="form.pro_date"
            @focus="openDatePickerPopUp"
            name="pro_date"
            placeholder="生产日期"
            label="生产日期"
            required
            readonly
            :rules="[{ required: true, message: '请选择生产日期' }]"
          />
          <van-field
            v-model="form.shelf_life_days"
            name="shelf_life_days"
            required
            placeholder="保质期"
            label="保质期"
            :rules="[{ validator: numReg, message: '请输入正确的保质期' }]"
          >
            <template #extra>
              <span>天</span>
            </template>
          </van-field>
          <div style="margin: 16px">
            <van-button round block type="info" native-type="submit"
              >提交</van-button
            >
          </div>
        </van-form>
      </div>
    </van-action-sheet>
    <!-- 时间选择弹窗 -->
    <van-popup
      v-model="datePickerPopUp"
      position="bottom"
      :style="{ height: '30%' }"
    >
      <!-- :min-date="minDate"
        :max-date="maxDate" -->
      <van-datetime-picker
        v-model="currentDate"
        type="date"
        title="选择年月日"
        @confirm="confirmDate"
        @cancel="cancel"
      />
    </van-popup>
    <!-- 商品选择弹窗 -->
    <van-popup
      v-model="searchGoodsdialog"
      position="bottom"
      style="height: 90%; padding-top: 30px; overflow: hidden"
      closeable
      class="van-clearfix"
      :safe-area-inset-bottom="true"
    >
      <div class="popup_box">
        <div class="popup_top">
          <van-field
            v-model="searchGoodsForm.keyWords"
            @input="onInputSearchGoods"
            center
            label="关键字"
            placeholder="按商品名称搜索"
            size="large"
            class="customSearchInput"
            name="keyWords"
          >
          </van-field>
        </div>

        <div class="popup_main">
          <van-list
            v-model="goodsLoading"
            :finished="goodsFinished"
            finished-text="没有更多了"
            @load="goodsOnLoad"
            style="padding-bottom: 40px"
          >
            <div
              v-for="item in goodsList"
              :key="item.goods_id"
              style="border-bottom: 1px solid #2c3e50"
            >
              <div @click="clickGoodsItem(item)" class="listItem">
                <div class="listIntroItem">
                  【{{ item.goods_brand }}】 {{ item.goods_name }} （{{
                    item.goods_spec
                  }}）
                </div>
                <!-- <div class="listIntroItem">
                  货位:{{ item.stock_location }}，生产日期：{{
                    item.pro_date
                  }}，有效期：{{ item.shelf_life_days }}天
                </div> -->
                <div class="listIntroItem">
                  主单位：{{ item.main_unit }},辅单位：{{ item.sub_unit }}
                </div>
              </div>
            </div>
          </van-list>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import moment from "moment";
import { Dialog } from "vant";
import { initJsStore } from "@/service/idb_service";
import { GoodsService } from "@/service/goods_service";
import axios from "axios";
// import { OrderService } from "@/service/localOrder_service";
export default {
  name: "savedOrder",
  data() {
    return {
      orderParams: {
        keyword: "",
        limit: 20,
        page: 1,
      },

      title: "",
      //   currentDate:this.$formatDate.nowFormat("YYYY-MM-DD"),
      loading: false,
      goodsLoading: false,
      searchGoodsdialog: false,
      finished: false,
      goodsFinished: false,
      currentDate: new Date(),
      formTitle: "添加",
      userName: "",
      btnStatus: "", //滑动时的按钮 1：copy 2：del
      form: {
        goods_name: "", //商品名称
        goods_spec: "", //规格
        goods_brand: "", //品牌name
        main_unit: "件", //主单位
        sub_unit: "袋", //辅单位
        main_num: "", //主单位数量
        sub_num: "", //辅单位数量
        stock_location: "",
        person: "", //操作人
        shelf_life_days: "", //保质期
        pro_date: "", //生产日期
      },
      searchGoodsForm: { keyWords: "", limit: 20, page: 1 },
      dialogShow: false, //form表单弹窗
      datePickerPopUp: false, //日期选择弹窗
      value1: "",
      //商品列表
      goodsList: [],
      currentGoods: null,
      //待提交订单
      orders: [],
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
    this.baseUrl = process.env.VUE_APP_BASE_API_PURCHASE;
    let userName = localStorage.getItem("userName");
    if (userName) {
      this.userName = userName;
    } else {
      location.href = "/login";
    }
  },
  methods: {
    //触发条件:滚动条到底部一定距离、首次渲染自动触发
    listOnLoad() {
      this.searchOrders();
    },
    //点击订单列表搜索按钮
    onSearchOrderList() {
      this.orderParams.page = 1;
      // this.orderParams.keyWords = "";
      this.orders = [];
      this.searchOrders();
    },
    async searchOrders() {
      let url = this.baseUrl + "/api/stocktacking/getRecordList";
      axios
        .post(url, this.orderParams)
        .then(({ data }) => {
          this.finished = false;
          let list = data.data.data;

          if (list && list.length > 0) {
            for (let i = 0; i < list.length; i++) {
              this.orders.push(list[i]);
            }
          }
          this.loading = false;
          if (list.length < this.orderParams.limit) {
            this.finished = true;
            return;
          }
          this.orderParams.page += 1;
          // this.insertGoodsToDb(data.data);
        })
        .catch((err) => {
          console.log("err", err);
        });
    },
    //保存到本地数据库
    async onSubmit(values) {
      let listItem = JSON.parse(JSON.stringify(values));
      listItem.goods_id = this.form.goods_id;
      listItem.main_unit = this.form.main_unit;
      listItem.sub_unit = this.form.sub_unit;
      listItem.person = this.userName;

      listItem.id = this.currentOrderId;

      let params = {
        is_update: true,
        list: [listItem],
      };
      let url = this.baseUrl + "/api/stocktacking/saveRecord";
      axios
        .post(url, params)
        .then(() => {
          this.dialogShow = false;
          this.orderParams.keyword = "";
          this.onSearchOrderList();
        })
        .catch((err) => {
          console.log("err", err);
        });
    },
    //商品输入框获取焦点 打开商品搜索弹窗
    openSearchGoodsListDialog() {
      this.searchGoodsdialog = true;
    },
    onInputSearchGoods() {
      this.searchGoodsForm.page = 1;
      this.goodsList = [];
      this.searchGoods();
    },

    goodsOnLoad() {
      this.searchGoods();
    },
    //搜索商品
    async searchGoods() {
      try {
        let res = await new GoodsService().getGoodsByGoodsName(
          this.searchGoodsForm.keyWords,
          this.searchGoodsForm.limit,
          this.searchGoodsForm.page
        );
        this.goodsFinished = false;
        if (res && res.length > 0) {
          for (let i = 0; i < res.length; i++) {
            this.goodsList.push(res[i]);
          }
        }
        this.goodsLoading = false;
        if (res.length < this.searchGoodsForm.limit) {
          this.goodsFinished = true;
          return;
        }
        this.searchGoodsForm.page += 1;
      } catch (error) {
        console.log("error", error);
      }
    },
    //点击选择商品
    clickGoodsItem(goods) {
      this.currentGoods = JSON.parse(JSON.stringify(goods));
      this.form = this.currentGoods;
      this.searchGoodsdialog = false;
    },
    //返回
    goBack() {
      this.$router.go(-1);
    },
    //点击时间选择 打开弹窗
    openDatePickerPopUp() {
      this.datePickerPopUp = true;
    },
    //时间选择 确认
    confirmDate(value) {
      this.form.pro_date = moment(value).format("YYYY-MM-DD");
      this.datePickerPopUp = false;
    },
    //日期选择 点击取消 关闭弹窗
    cancel() {
      this.datePickerPopUp = false;
    },
    beforeClose({ name, position, instance }) {
      let id = name;
      switch (position) {
        case "left":
        case "cell":
        case "outside":
          instance.close();
          break;
        case "right":
          //删除
          Dialog.confirm({
            message: "确定删除吗？",
          })
            .then(async () => {
              try {
                let url = this.baseUrl + "/api/stocktacking/deleteRecord";
                axios
                  .post(url, { id })
                  .then(() => {
                    this.dialogShow = false;
                    this.orderParams.keyword = "";
                    this.onSearchOrderList();
                  })
                  .catch((err) => {
                    console.log("err", err);
                  });
                instance.close();
              } catch (error) {
                console.log("error", error);
              }
            })
            .catch(() => {
              instance.close();
            });

          break;
      }
    },

    //点击订单
    clickItem(e) {
      this.dialogShow = true;
      this.form = JSON.parse(JSON.stringify(e));
      this.currentOrderId = e.id;
      this.formTitle = "编辑";
    },
    numReg(val) {
      return /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(val);
    },

    subUnitnumReg(val) {
      if (val === "") {
        return true;
      } else {
        return /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(val);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.customCell {
  text-align: left;
  .van-cell__title {
    flex: 4;
  }
}
.customDateCell {
  text-align: left;
  .van-cell__value {
    flex: 2.5;
    text-align: left;
  }
}
.customSelectCell {
  text-align: left;
  .van-cell__value {
    flex: 3;
    text-align: left;
    .el-select {
      width: 100%;
    }
  }
}
.van-swipe-cell ::v-deep {
  min-height: 100px;
  border-bottom: 1px solid #ebedf0;
  .van-swipe-cell__wrapper {
    min-height: 100px;

    // display: flex;
  }
  .delete-button {
    height: 100%;
  }
}
.customSearchInput ::v-deep {
  // position: absolute;
  // top: 0;
  .van-field__control {
    font-size: 16px;
  }
}
.listItem {
  padding: 10px;
}
.listIntroItem {
  text-align: left;
  padding: 5px;
}
.introText{
  color:#969799
}

.popup_box {
  height: 100%;
  background-color: #fff;
  padding-top: 40px;
  padding-bottom: 40px;
  overflow: hidden;
  position: relative;
  .popup_top {
    width: 100%;
    height: 40px;
    position: absolute;
    top: 0;
    display: flex;
    align-items: center;
    .van-icon-cross {
      font-size: 0.43rem;
      color: #181818;
      margin-left: 3.21rem;
    }
    .title {
      margin-left: 4.15rem;
      height: 0.43rem;
      font-family: PingFangSC-Medium;
      font-weight: 500;
      font-size: 0.43rem;
      color: #181818;
      line-height: 0.43rem;
    }
  }
  // .popup_bottom {
  //   width: 10rem;
  //   height: 1.31rem;

  //   position: absolute;
  //   bottom: 0;
  //   display: flex;

  //   .reset_btn {
  //     width: 4rem;
  //     height: 1.31rem;
  //     background: #fff;
  //   }
  //   .confirm_btn {
  //     width: 6rem;
  //     height: 1.31rem;
  //     background: #f84730;
  //   }
  // }
  .popup_main {
    height: 100%;
    overflow-y: scroll;
    // background-color: #fcf;
    // margin-bottom: 40px;
  }
}
</style>