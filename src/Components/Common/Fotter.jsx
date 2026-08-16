import FotterLinks from './FotterLinks'
import { Link } from 'react-router-dom'
import { FaHeart } from 'react-icons/fa'

const Fotter = () => {
  return (
            <div className=" bg-richblack-800  h-[40rem] w-full shadow-lg shadow-blue-900/30 backdrop-blur-md  border-t-[1px] border-white/20 flex flex-col ">       
     
              <FotterLinks/>
            
            
              <div  className=" bg-richblack-800  h-[5rem] w-[80%] mx-auto shadow-lg shadow-blue-900/30 backdrop-blur-md  border-t-[1px] border-white/20 flex justify-between items-center  " >
     
                 <div className="flex gap-x-3  h-[50%] justify-center items-center ">
                     <Link to={"/policy"} className=" text-sm  text-richblack-400 ">Privacy</Link>
                      <div className="w-[.1rem] h-[40%] bg-richblack-400 my-auto "></div>
                      <Link to={"/policy"} className=" text-sm text-richblack-400 ">Cookie Policy</Link>
                      <div className="w-[.1rem] h-[40%] bg-richblack-400 my-auto "></div>
                      <Link to={"/policy"} className=" text-sm text-richblack-400 ">Terms</Link>
                 </div>
     
                <div className="flex items-center justify-center gap-x-2 text-sm text-richblack-400">
                     <p>Made with</p>
                     <FaHeart fill="red" size={10}/>
                     <p>CodeHelp @ 2025 Studynotion</p>
                </div>

              </div>
            </div>
  )
}

export default Fotter