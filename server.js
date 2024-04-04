///Imports or requirements here
const bodyParser = require('body-parser')
const dotEnv = require('dotenv')
const express = require('express')
const app = express()
const {connectDB} = require('./model/queries')
const userRouter = require('./routes/UserRoutes')
const cors = require('cors')
const OPENAI = require('openai')

////////////////////////////
//Actual code
app.locals.count = 0;
dotEnv.config()
const openai =new OPENAI({
    apiKey:process.env.API_KEY_OPENAI
})
const fallBackDescription = ""
const fallBackInterviewQuestions = {
    "interviewQuestions": [
      {
        "question": "Can you provide an example of a time when you had to manage multiple administrative tasks simultaneously? How did you prioritize and ensure all tasks were completed accurately and on time?"
      },
      {
        "question": "How do you ensure effective communication between different departments? Can you share an experience where your communication skills were crucial in facilitating collaboration?"
      },
      {
        "question": "Describe a project you have assisted with in the past. What specific tasks did you handle, and how did your contributions impact the project's success?"
      },
      {
        "question": "How do you approach resolving customer inquiries or issues? Can you share a situation where you successfully addressed a customer's concern, and what was the outcome?"
      },
      {
        "question": "How do you maintain accurate and organized records? Can you discuss a time when your attention to detail prevented a potential error or issue?"
      },
      {
        "question": "Give an example of a time when you were responsible for coordinating a meeting or event. How did you ensure everything ran smoothly, and what challenges did you overcome?"
      },
      {
        "question": "How do you handle unexpected changes or interruptions in your workday? Can you provide an example of a situation where you had to adapt quickly and manage competing priorities?"
      },
      {
        "question": "Which specific tools or software are you proficient in, especially in relation to administrative and operational tasks? How have these skills contributed to your previous roles?"
      },
      {
        "question": "Describe a project where you collaborated with team members from different departments. How did you ensure effective communication and cooperation to achieve the project goals?"
      },
      {
        "question": "What steps do you take to stay updated on industry trends and improve your skills? Can you provide an example of how you have applied new knowledge or skills in a previous role?"
      },
      {
        "question": "Share an experience where you identified a process improvement opportunity. How did you approach the situation, and what was the outcome of your efforts?"
      }
    ]
  }
  
app.use(cors({origin:process.env.CLIENT_ORIGIN}))
app.use(bodyParser.urlencoded({extended:false}))
app.use(express.json())
app.use('/api/v1/user', userRouter)
app.get('/', (req,res)=>{
    res.json({message:'You are connected to Interview AI backend API.'})
})

app.get('/api/v1/description', async (req,res)=>{
    
    const params = req.query ?? 'software engineer'
    const requestJobTitle = req.query.jobTitle ?? 'Job roles'
    app.locals.jobTitle = requestJobTitle
    console.log(params.jobTitle)
    console.log('received request')
    
    const openAIResponse = await openai.chat.completions.create({
        messages:[{role:'system', content:`You are a helpful engine with access to a job portal, generate a job description for ${requestJobTitle} roles in canada.`}], 
        model:"gpt-3.5-turbo"
    })
    console.log(openAIResponse)
    console.log(openAIResponse.choices[0].message)
    res.status(200).json({received:true, message:'Your request has been received, we will update this to generate a job description.', chat:openAIResponse.choices[0].message.content})
})

app.post('/api/v1/description', async(req,res)=>{
    let description = req.body.description
    let jobTitle = req.body.jobTitle
    app.locals.jobTitle = jobTitle
    console.log(`Description received`)
    console.log(description)
    app.locals.description = description
    if(description){
        res.status(200).json({message:'Your request has been received.'})
    }
    else{
        res.status(400).json({message:'Your request was incomplete. Please add full description of job role or generate one.'})
    }
})

app.get('/api/v1/interview', async (req,res)=>{
    let jobTitle = app.locals.jobTitle ?? 'Any'
    let jobDescription = app.locals.description ?? fallBackDescription
    console.log('received interview request.')
    app.locals.count += 1;
    console.log('open ai api called, ',app.locals.count)
    try{
        console.log('making api call.')
        let chat = await openai.chat.completions.create({
            messages:[{role:'system', content:`You are a seasoned recruiter at a company hiring for ${jobTitle} roles based on the job description below:${jobDescription}.Use this information to generate interview questions that will help a candidate preparing for interviews in their field, focus on generating questions that the interviewee can verbally answer, be it behavioural or related to their job role. Return an array of questions in JSON format.`}], 
            model:'gpt-3.5-turbo-1106', 
            response_format:{type:'json_object'}
        })
        console.log(chat)
        console.log('//////////////')
        console.log(chat.choices[0].message.content)
        res.status(200).json({message:'Your request was successfully received.', questions:chat.choices[0].message.content})
    }
    catch(err){
        res.status(500).json({message:'We were unable to parse your request, please try again later.', error:err})
    }
    
    

})

app.post('/api/v1/interview/answers', (req,res)=>{
  console.log('A request has been received')
  console.log(req.body)
  res.status(200).json({message:'Answers have been received.'})
})

PORT = process.env.PORT || 2000
app.listen(PORT, ()=>{
    console.log('server has been started on port ', PORT)
    connectDB()
})