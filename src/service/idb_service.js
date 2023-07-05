import { connection } from "./jsstore_con";
import { DATA_TYPE } from "jsstore";

const getDatabase = () => {

    const tblGoods={
        name:'Goods',
        columns:{
            goods_id:{
                primaryKey:true,
                autoIncrement:false,
            },
            goods_name:{
                notNull: true,
                dataType: DATA_TYPE.String
            },
            goods_spec:{
                default:'',
                dataType: DATA_TYPE.String
            },
            goods_brand:{
                default:'',
                dataType: DATA_TYPE.String
            },
            main_unit:{
                notNull: true,
                dataType: DATA_TYPE.String
            },
            sub_unit:{
                dataType:DATA_TYPE.String,
                default:''
            }
        }
    }

    const tblOrders={
        name:'Orders',
        columns:{
            order_id:{
                primaryKey:true,
                autoIncrement:true,
            },
            goods_id:{
                notNull: true,
                dataType: DATA_TYPE.Number
            },
            goods_name:{
                notNull: true,
                dataType: DATA_TYPE.String
            },
            goods_spec:{
                default:'',
                dataType: DATA_TYPE.String
            },
            goods_brand:{
                default:'',
                dataType: DATA_TYPE.String
            },
            main_unit:{
                notNull: true,
                dataType: DATA_TYPE.String
            },
            sub_unit:{
                default:'',
                dataType:DATA_TYPE.String
            },
            pro_date:{
                default:'',
                dataType:DATA_TYPE.String
            },
            shelf_life_days:{
                default:'',
                dataType:DATA_TYPE.String
            },
            main_num:{
                default:'',
                dataType:DATA_TYPE.String
            },
            sub_num:{
                default:'',
                dataType:DATA_TYPE.String
            },
            stock_location:{
                default:'',
                dataType:DATA_TYPE.String
            },
            person:{
                notNull:true,
                dataType:DATA_TYPE.String
            }
        }
    }


    const dataBase = {
        name: "Vue_Demo",
        tables: [tblGoods,tblOrders]
    };
    return dataBase;
};

export const initJsStore = async () => {
    const dataBase = getDatabase();
    return await connection.initDb(dataBase);
};

