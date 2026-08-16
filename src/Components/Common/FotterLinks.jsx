import React from "react";
import { FooterLink1, FooterLink2 } from "../../data/footer-links";
import { Link } from "react-router-dom";
import { FaFacebook, FaGoogle, FaTwitter, FaYoutube } from "react-icons/fa";

const FotterLinks = () => {
  return (
    <div className=" mx-auto flex w-[90%]  h-full">
      
      <div className="  h-[85%] my-auto w-[50%]   flex justify-evenly  ">
          {
            FooterLink1.map(( footer , index )=>(
              <div className="flex flex-col " key={index}>
                 <img src={footer.Websitelogo} className=" w-[10rem]"></img>
                 <p className={`text-white text-lg font-semibold ${index === 0 && "mt-4"}`}>{footer.title1}</p>
                 <div className="mt-5 space-y-[.4rem] flex flex-col">
                  {
                    footer.links1.map((link , index)=>(
                      <Link to={link.title} key={index} className=" text-sm text-richblack-400">{link.title}</Link>
                    ))
                  }
                 </div>
                 <div>
                  {
                    index === 0  && 
                    <div className=" flex gap-x-2 mt-3">
                        <FaGoogle fill="#6E727F" size={20}/>
                        <FaTwitter fill="#6E727F" size={20}/>
                        <FaYoutube fill="#6E727F" size={20}/>
                        <FaFacebook fill="#6E727F" size={20}/>
                    </div>
                  }
                 </div>
              </div>
            ))
          }
      </div>

      
      <div className=" h-[85%] my-auto w-[50%]  border-l  border-richblack-400  flex justify-evenly ">
        {
            FooterLink2.map( ( footer , index)=>(
                <div className="flex flex-col " key={index}>
                    <p className="text-white text-lg font-semibold">{footer.title}</p>
                    <div className="mt-5 space-y-[.4rem] flex flex-col">{
                        footer.links.map((singleLink , index)=>(
                            <Link to={singleLink.link} key={index} className=" text-sm text-richblack-400">{singleLink.title}</Link>
                        ))
                    }</div>
                </div>
            ))
        }
      </div>
    </div>
    
  );
};

export default FotterLinks;
