const { sequelize } = require("../config/dbconnection");
const db = require("../model");

async function createUser(data, txnCtx) {

    const requiredFields = ['name', 'phone', 'age', 'church_name', 'section'];

    for (let field of requiredFields) {
        if (!data[field] || data[field].toString().trim() == '') {
            return { status: 'error', message: `Please enter your ${field.replace('_', ' ')}` };
        }
    }
    let userDataRes = await db.Registration.create(data,{transaction:txnCtx});
    if(!userDataRes){
        return {status:'error',message:'user is not created!!'}
    }
    return {status:'success',message:'User is Created!!!',data:userDataRes.dataValues}
}


module.exports = {
    async createUser(req,res){
        const txnCtx = await sequelize.transaction();
        try {
            let data = req.body;
            if(!data){
                return res.json({status:'error',message:'All Fields are Required!!!'})
            }
            let userRes = await createUser(data,txnCtx);
            if(userRes.status == 'error'){
                await txnCtx.rollback()
                return res.json(userRes)
            }
            await txnCtx.commit();
            return res.json(userRes)
        } catch (err) {
            await txnCtx.rollback();
            console.log(err);
            return res.json({status:'error',catchError:err})
            
        }
    }
}