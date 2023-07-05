import { connection } from "./jsstore_con";

export class OrderService {

    constructor() {
        this.tableName = "Orders";
    }
    //获取order列表
    getAllLocalOrderList() {
        return connection.select({
            from: this.tableName,
        })
    }
    //添加单个order
    addOrder(order) {
        return connection.insert({
            into: this.tableName,
            values: [order],
            return: true
        })
    }
    //根据产品名称|货位查询商品
    getOrderByGoodsName(keyWords,pageSize,pageNum) {
        return connection.union([{
            from: this.tableName,
            limit:pageSize,
            skip:(pageNum - 1) * pageSize,
            where: {
                goods_name:{like:'%'+keyWords+'%'},
            }
        },
        {
            from: this.tableName,
            limit:pageSize,
            skip:(pageNum - 1) * pageSize,
            where: {
                stock_location:{like:'%'+keyWords+'%'}
            }
        }])
    }
    //更新订单
    updateOrder(order) {
        return connection.update({
            in: this.tableName,
            set: {
                goods_id:order.goods_id,
                goods_name:order.goods_name,
                goods_spec:order.goods_spec,
                goods_brand:order.goods_brand,
                main_unit:order.main_unit,
                sub_unit:order.sub_unit,
                pro_date:order.pro_date,
                shelf_life_days:order.shelf_life_days,
                main_num:order.main_num,
                sub_num:order.sub_num,
                stock_location:order.stock_location,
                person:order.person
            },
            where: {
                order_id: order.order_id
            }
        })
    }
    //移除订单
    removeOrder(order_id) {
        return connection.remove({
            from: this.tableName,
            where: {
                order_id: order_id
            }
        })
    }
    //移除所有订单
    removeAllOrder(){
        return connection.clear(this.tableName)
    }

}