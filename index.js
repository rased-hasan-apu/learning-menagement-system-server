const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());

var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.kess7.mongodb.net:27017,cluster0-shard-00-01.kess7.mongodb.net:27017,cluster0-shard-00-02.kess7.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-p73rme-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);

async function run(){
    try{
        await client.connect();
        const database = client.db('pthshala');
        const servicesCollection = database.collection('addCourse');
        const usersCollection = database.collection('users');
        const orderCollection = database.collection('orderData');

        // get API
        app.get('/addCourse',async(req,res)=>{
            const cursor = servicesCollection.find({});
            const cources =await cursor.toArray();
            res.send(cources);
        })
        //post API
        app.post('/addCourse',async(req,res)=>{
            const course = req.body;
            console.log('hit the post api',course);
            const result =await servicesCollection.insertOne(course);
            console.log(result);
            res.send(result)
        });
        //get orderData 
        app.get('/orderData',async(req,res)=>{
            //res.send('hit it bro bro hit it ');
            const cursor = orderCollection.find({});
            const order = await cursor.toArray()
            res.send(order);
            
        })
        //add orderData 

        app.post('/orderData',async(req,res)=>{
            const result = await orderCollection.insertOne(req.body);
            res.json(result);
        })
           //get user
           app.get('/users/:email',async(req,res)=>{
            const email = req.params.email;
            const query = {email:email};
            const user=await usersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role ==='admin'){
                isAdmin=true;
            }
            res.json({admin: isAdmin});
        })
    
            // add user 
            app.post('/users',async(req,res)=>{
                const user = req.body;
                const result = await usersCollection.insertOne(user);
                console.log(result);
                res.json(result);
            })
    
            app.put('/users',async(req,res)=>{
                const user = req.body;
                const filter = {email:user.email};
                const options = {upsert:true};
                const updateDoc = {$set:user};
                const result = await usersCollection.updateOne(filter,updateDoc,options);
                res.json(result);
            })
            //make admin
            app.put('/users/admin',async(req,res)=>{
                const user=req.body;
                const filter={email:user.email};
                const updateDoc={$set:{role:'admin'}};
                const result = await usersCollection.updateOne(filter,updateDoc);
                res.json(result);
            })
        
    }
           
           
    finally{
        //await client.close();
    }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('lerning menagement server');

});

app.listen(port,()=>{
    console.log(`server run at port:${port}`)
})