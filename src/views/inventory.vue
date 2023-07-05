<!-- 
 * @description: 盘点页面
 * @fileName: inventory.vue 
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
      <!-- <template #right>
        <van-icon name="search" size="18" />
      </template> -->
    </van-nav-bar>
    <div style="margin-bottom:10px">本地数据</div>
    <van-button
      type="primary"
      icon="plus"
      size="large"
      style="width: 80%; margin-bottom: 20px"
      @click="addInventory"
      >添加</van-button
    >
    <div style="display: flex; align-items: center; padding: 0 5px">
      <van-field
        v-model="orderParams.keyWords"
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

    <!-- 待提交的列表 -->
    <van-list
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-swipe-cell
        v-for="item in orders"
        :key="item.order_id"
        :before-close="beforeClose"
        :name="item.order_id"
      >
        <div @click="clickItem(item)" class="listItem">
          <div class="listIntroItem">
            【{{ item.goods_brand }}】 {{ item.goods_name }} （{{
              item.goods_spec
            }}）
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
        </div>

        <template #right>
          <van-button
            square
            type="primary"
            text="复制"
            id="复制"
            class="delete-button"
            @click="copyOrder"
          />
          <van-button
            square
            text="删除"
            type="danger"
            id="删除"
            class="delete-button"
            @click="delOrder"
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
          <!-- 通过 pattern 进行正则校验 -->
          <!-- :rules="[{ pattern, message: '请输入正确内容' }]" -->
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
                  label="整"
                  required
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
            placeholder="保质期"
            required
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
import { OrderService } from "@/service/localOrder_service";
export default {
  name: "Inventory",
  data() {
    return {
      orderParams: {
        keyWords: "",
        pageSize: 20,
        pageNum: 1,
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
      searchGoodsForm: { keyWords: "", pageSize: 20, pageNum: 1 },
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
    let userName = localStorage.getItem("userName");
    if (userName) {
      this.userName = userName;
    } else {
      location.href = "/login";
    }
  },
  methods: {
    onLoad() {
      this.searchOrders();

      // 异步更新数据
      // setTimeout 仅做示例，真实场景中一般为 ajax 请求
      // setTimeout(() => {
      //   for (let i = 0; i < 10; i++) {
      //     this.orders.push(this.orders[0]);
      //   }
      //   // 加载状态结束
      //   this.loading = false;
      //   // 数据全部加载完成
      //   if (this.orders.length >= 40) {
      //     this.finished = true;
      //   }
      // }, 1000);
      // this.searchGoods();
    },
    //点击订单列表搜索按钮
    onSearchOrderList() {
      this.orderParams.pageNum = 1;
      // this.orderParams.keyWords = "";
      this.orders = [];
      this.searchOrders();
    },
    async searchOrders() {
      try {
        let res = await new OrderService().getOrderByGoodsName(
          this.orderParams.keyWords,
          this.orderParams.pageSize,
          this.orderParams.pageNum
        );
        this.finished = false;
        if (res && res.length > 0) {
          for (let i = 0; i < res.length; i++) {
            this.orders.push(res[i]);
          }
        }
        this.loading = false;
        if (res.length < this.orderParams.pageSize) {
          this.finished = true;
          return;
        }
        this.orderParams.pageNum += 1;

        // this.goodsFinished = true;
      } catch (error) {
        console.log("error", error);
      }
    },
    //保存到本地数据库
    async onSubmit(values) {
      let form = JSON.parse(JSON.stringify(values));
      form.goods_id = this.form.goods_id;
      form.main_unit = this.form.main_unit;
      form.sub_unit = this.form.sub_unit;
      form.person = this.userName;
      if (this.form.order_id) {
        form.order_id = this.form.order_id;
      }
      try {
        if (form.order_id) {
          await new OrderService().updateOrder(form);
        } else {
          await new OrderService().addOrder(form);
        }
        this.dialogShow = false;
        this.orderParams.keyWords = "";
        this.onSearchOrderList();
      } catch (error) {
        console.log("error", error);
        alert("error", error);
      }
    },
    //添加盘点商品数据 打开
    addInventory() {
      this.dialogShow = true;
      this.formTitle = "添加";
      if(this.form.order_id){
        delete this.form['order_id']
      }
    },
    //商品输入框获取焦点 打开商品搜索弹窗
    openSearchGoodsListDialog() {
      this.searchGoodsdialog = true;
    },
    onInputSearchGoods() {
      this.searchGoodsForm.pageNum = 1;
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
          this.searchGoodsForm.pageSize,
          this.searchGoodsForm.pageNum
        );
        this.goodsFinished = false;
        if (res && res.length > 0) {
          for (let i = 0; i < res.length; i++) {
            this.goodsList.push(res[i]);
          }
        }
        this.goodsLoading = false;
        if (res.length < this.searchGoodsForm.pageSize) {
          this.goodsFinished = true;
          return;
        }
        this.searchGoodsForm.pageNum += 1;

        // this.goodsFinished = true;
      } catch (error) {
        console.log("error", error);
      }
    },
    //点击选择商品
    clickGoodsItem(goods) {
      this.currentGoods = JSON.parse(JSON.stringify(goods));
      // goods_name: "", //商品名称
      //   goods_spec: "", //规格
      //   goods_brand: "", //品牌name
      //   main_unit: "件", //主单位
      //   sub_unit: "袋", //辅单位
      //   main_num: "", //主单位数量
      //   sub_num: "", //辅单位数量
      //   stock_location: "",
      //   person: "", //操作人
      //   shelf_life_days: "", //保质期
      //   pro_date: "", //生产日期
      this.form.goods_name = this.currentGoods.goods_name;
      this.form.goods_spec=this.currentGoods.goods_spec;
      this.form.goods_brand=this.currentGoods.goods_brand;
      this.form.main_unit=this.currentGoods.main_unit;
      this.form.sub_unit=this.currentGoods.sub_unit;
      this.form.goods_id=this.currentGoods.goods_id;

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
    copyOrderFunc() {
      this.dialogShow = true;
      this.formTitle = "添加";
      this.form = {
        goods_name: this.copyOrderForm.goods_name, //商品名称
        goods_spec: this.copyOrderForm.goods_spec, //规格
        goods_brand: this.copyOrderForm.goods_brand, //品牌name
        main_unit: this.copyOrderForm.main_num, //主单位
        sub_unit: this.copyOrderForm.sub_unit, //辅单位
        main_num: this.copyOrderForm.main_num, //主单位数量
        sub_num: this.copyOrderForm.sub_num, //辅单位数量
        stock_location: this.copyOrderForm.stock_location, //货位
        person: this.copyOrderForm.person, //操作人
        shelf_life_days: this.copyOrderForm.shelf_life_days, //保质期
        pro_date: this.copyOrderForm.pro_date, //生产日期
        goods_id: this.copyOrderForm.goods_id, //goodsid
      };
    },
    beforeClose({ name, position, instance }) {
      console.log(name, position, instance);
      let order_id = name;
      switch (position) {
        case "left":
        case "cell":
        case "outside":
          instance.close();
          break;
        case "right":
          if (this.btnStatus == 1) {
            //复制
            let findItem = this.orders.find(
              (item) => item.order_id == order_id
            );
            if (findItem) {
              this.copyOrderForm = findItem;
              this.copyOrderFunc();
            }
            instance.close();
          } else {
            //删除
            Dialog.confirm({
              message: "确定删除吗？",
            })
              .then(async () => {
                try {
                  let res = await new OrderService().removeOrder(order_id);
                  this.onSearchOrderList();
                  instance.close();
                } catch (error) {
                  console.log("error", error);
                }
              })
              .catch(() => {
                instance.close();
              });
          }

          break;
      }
    },

    //点击订单
    clickItem(e) {
      this.dialogShow = true;
      this.form = JSON.parse(JSON.stringify(e));
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
    copyOrder() {
      this.btnStatus = 1;
    },
    delOrder() {
      // console.log('del',e)
      this.btnStatus = 2;
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