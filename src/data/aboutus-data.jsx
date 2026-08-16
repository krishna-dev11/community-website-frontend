import image from "../assets/Images/FoundingStory.png"
import aboutUs1 from "../assets/Images/aboutus1.webp"
import aboutUs2 from "../assets/Images/aboutus2.webp"
import aboutUs3 from "../assets/Images/aboutus3.webp"

export const topImages = [
    {
      id:1,
      imageUrl : aboutUs1 
    },
    {
      id:2,
      imageUrl : aboutUs2
    },
    {
       id:3,
       imageUrl : aboutUs3
    }
]

export const Founding = [
    {
        id:1,
        type:String,
        heading:"Our Founding Story ",
        description1:"Our e-learning platform was born out of a shared vision and passion for transforming education. It all began with a group of educators, technologists, and lifelong learners who recognized the need for accessible, flexible, and high-quality learning opportunities in a rapidly evolving digital world.",
        description2:"As experienced educators ourselves, we witnessed firsthand the limitations and challenges of traditional education systems. We believed that education should not be confined to the walls of a classroom or restricted by geographical boundaries. We envisioned a platform that could bridge these gaps and empower individuals from all walks of life to unlock their full potential.",
        gradient:"bg-[linear-gradient(118deg,_#833AB4_-2.4%,_#FD1D1D_52.25%,_#FCB045_106.89%)] bg-clip-text text-transparent text-[2.23rem] font-inter font-semibold leading-[2.75rem]"
    },
    {
        id:2,
        type:Image,
        imageUrl : image ,
        gradient:"bg-[linear-gradient(118deg,_#EC008C_-0.91%,_#FC6767_104.91%)] bg-clip-text text-transparent text-[2.23rem] font-inter font-semibold leading-[2.75rem]"
    },
    {
        id:3,
        heading:"Our Vision",
        description1:"With this vision in mind, we set out on a journey to create an e-learning platform that would revolutionize the way people learn. Our team of dedicated experts worked tirelessly to develop a robust and intuitive platform that combines cutting-edge technology with engaging content, fostering a dynamic and interactive learning experience.",
        gradient:"bg-[radial-gradient(circle_1008px_at_-0.5%_50.2%,_rgba(255,85,0,1)_0%,_rgba(255,246,73,1)_50.4%,_rgba(0,233,50,1)_100.2%)]  bg-clip-text text-transparent text-[2.23rem] font-inter font-semibold leading-[2.75rem]"
    },
    {
        id:4,
        heading:"Our Mission",
        description1:"our mission goes beyond just delivering courses online. We wanted to create a vibrant community of learners, where individuals can connect, collaborate, and learn from one another. We believe that knowledge thrives in an environment of sharing and dialogue, and we foster this spirit of collaboration through forums, live sessions, and networking opportunities.",
        gradient:"bg-gradient-to-br from-[#0093E9] to-[#80D0C7] bg-clip-text text-transparent text-[2.23rem] font-inter font-semibold leading-[2.75rem]"
    }
]

export const  Accomplishment = [
    {
        id:1,
        heading:"5K",
        description:"Active Students"
    },
    {
        id:1,
        heading:"10+",
        description:"Mentors"
    },
    {
        id:1,
        heading:"200+",
        description:"Courses"
    },
    {
        id:1,
        heading:"50+",
        description:"Awards"
    }
]

export const AnyOne_Anywhere = [
    {
        id:1,
        heading1: "World-Class Learning for ",
        heading2: "Anyone , Anywhere",
        heading2_gradient:"bg-gradient-to-br from-[#0093E9] to-[#80D0C7] bg-clip-text text-transparent text-[1.7rem] font-inter font-semibold leading-[2.75rem]",
        heading_Part2: ", Anywhere",
        description : " Studynotion partners with more than 275+ leading universities and companies to bring flexible, affordable, job-relevant online learning to individuals and organizations worldwide. ",
        ButtonLink : "/learnmore",
        ButtonData :"Learn More"
    },
    {
        id:2,
        heading1: "Curriculum Based on",
        heading2: "Industry Needs",
        description : "Save time and money! The Belajar curriculum is made to be easier to understand and in line with industry needs.",
    },
    {
        id:3,
        heading1: "Our Learning",
        heading2: "Methods",
        description : "The learning process uses the namely online and offline.",
    },
    {
        id:4,
        heading1: "Certification",
        description : "You will get a certificate that can be used as a certification during job hunting.",
    },
    {
        id:5,
        heading1: "Rating",
        heading2: "Auto-grading" ,
        description : "You will immediately get feedback during the learning process without having to wait for an answer or response from the mentor.",
    },
    {
        id:6,
        heading1: "Ready to",
        heading2: "Work",
        description : "Connected with over 150+ hiring partners, you will have the opportunity to find a job after graduating from our program.",
    }
]