const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const express = require('express');

//must be dite hobe
require('dotenv').config()

const cors = require('cors');
const app=express()
const port=process.env.PORT || 3000;

app.use(cors())
app.use(express.json())

//roommaster
//room6969



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

    app.get('/jobs',async(req,res)=>{
        const cursor=jobsCollection.find();
        const result=await cursor.toArray();
        res.send(result)
    })

    app.get('/jobs/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id: new ObjectId(id)}
        const result=await jobsCollection.findOne(query)
        res.send(result)
    })
    

    //job application api
    //get all data,get one data, get some data



    app.post('/job-applications',async(req,res)=>{
        const application=req.body;
       const result=await jobApplicationCollection.insertOne(application)
       res.send(result)

    })

    //get job appliccants apllied data by query
    app.get('/job-application',async(req,res)=>{
        const email=req.query.email;
        const query={ applicant_email: email }
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
