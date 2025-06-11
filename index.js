const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const express = require('express');

const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')

//must be dite hobe
require('dotenv').config()

const cors = require('cors');
const app=express()
const port=process.env.PORT || 3000;

//middle wire
app.use(cors({
    origin:['http://localhost:5174'],
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())

//roommaster
//room6969

const logger=(req,res,next)=>{
    console.log('insise the logger');
    next()
    
}

const verifyToken=(req,res,next)=>{
    // console.log('inside verify token middlewire', req.cookies);
    const token=req.cookies?.token; // token use kora hoice karom cookies call korar smy token name e call kora hoice, check  -> app.post('/jwt'.....



    if(!token){
        return res.status(401).send({message:'Unauthorizes access'})
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
        if(err){
            return res.status(401).send({message:'Authorized access'})
        }

        req.tokenInformation=decoded; //req.jekono name

        //
       next()

    })
    
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.iy6spfv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    //jobs reated apis

    const jobsCollection=client.db('JobPortalDB').collection('jobs')

    const jobApplicationCollection=client.db('JobPortalDB').collection('job_applications')

    //auth related APIs
    app.post('/jwt', async(req,res)=>{
        const user=req.body;
        const token=jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
        res
        .cookie('token', token, {
            httpOnly:true,
            secure:false
        })
        .send({success: true})

    })



    app.get('/jobs',logger, async(req,res)=>{
        console.log('now inside the api callback');
        

        const email=req.query.email;
        let query={};
        if(email){
            query={hr_email: email}

        }

        const cursor=jobsCollection.find(query);
        const result=await cursor.toArray();
        res.send(result)
    })

    app.get('/jobs/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id: new ObjectId(id)}
        const result=await jobsCollection.findOne(query)
        res.send(result)
    })

    //create job
    app.post('/jobs', async(req,res)=>{
        const newJob=req.body;
        const result= await jobsCollection.insertOne(newJob);
        res.send(result)
    })


    
    

    //job application api
    //get all data,get one data, get some data



    app.post('/job-applications',async(req,res)=>{
        const application=req.body;
       const result=await jobApplicationCollection.insertOne(application)

       //not the best way. good way -> use aggrigate

       const id=application.job_id;
       const query={_id: new ObjectId(id)}
       const job=await jobsCollection.findOne(query);
       
       let newCount=0;
       if(job.applicationCount){
        newCount =job.applicationCount + 1;

       }
       else{
        newCount=1
       }
       

       //now update the job info

       const filter={_id: new ObjectId(id)}
       const updatedDoc={
        $set:{
            applicationCount:newCount
        }
       }
       const updatedResult=await jobsCollection.updateOne(filter, updatedDoc)





       res.send(result)

    })

    //get job appliccants apllied data by query
    app.get('/job-application', verifyToken, async(req,res)=>{
        const email=req.query.email;
        const query={ applicant_email: email }

        // console.log('cookiessss ', req.cookies);
        // console.log(req.tokenInformation.email);
        // console.log(req.query.email);
        
        

        if(req.tokenInformation.email !== req.query.email){
            return res.status(403).send({message: 'forbidden access'})
        }
        
        const result=await jobApplicationCollection.find(query).toArray();

        //fokira way to aggregate data. this is not the best way
        for(const appliation of result){
            console.log(appliation.job_id);
            
            const query1={_id: new ObjectId(appliation.job_id)}
            const job=await jobsCollection.findOne(query1)

            if(job){
                appliation.title=job.title;
                appliation.company=job.company;
                appliation.company_logo=job.company_logo;
                appliation.location=job.location;
                appliation.category=job.category;
                appliation.jobType=job.jobType;

            }

        }

        res.send(result)
    })


    app.delete('/job-application',async(req,res)=>{
        const email=req.query.email;
        const query={applicant_email: email}

        // console.log(query);
        
        const result=await jobApplicationCollection.deleteOne(query)
        res.send(result)

    })


    //job giver

    //jara jara apply korce tader list
    app.get('/job-applications/jobs/:job_id',async(req,res)=>{
        const jobId=req.params.job_id;
        const query={job_id: jobId};
        const result=await jobApplicationCollection.find(query).toArray();

        res.send(result)

    })

    //update applicants status. (hired,rejected...)
    app.patch('/job-applications/:id',async(req,res)=>{
        const id=req.params.id;
        const data=req.body
        const filter={_id:new ObjectId(id)}
        const updatedDoc={
            $set:{
                status: data.status
            }
        }
        const result=await jobApplicationCollection.updateOne(filter,updatedDoc)
        res.send(result)
    })

    
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send('job is falling from the sky')
})

app.listen(port, ()=>{
    console.log(`job is waiting at, ${port}`);
    
})
