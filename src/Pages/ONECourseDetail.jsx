

      
          
            

          

      
          
            

          

      
          

                

          
            

  
        

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { GetWholeCourseDetails } from "../services/Operations/CoursesAPI";
import {
  FiShare2,
  FiUser,
  FiCheckCircle,
  FiShield,
  FiTag,
  FiPlayCircle,
} from "react-icons/fi";
import OverviewofLectures from "../Components/Core/CourseDetails/OverviewofLectures";
import toast from "react-hot-toast";
import { AddNewCouseInCart } from "../services/Operations/CartAPI";
import GetAvgRating from "../Utilities/avgRating";
import copy from "copy-to-clipboard";
import ReactStars from "react-stars";
import ModernFooter from "../Components/Core/Home/ModernFooter";
import OurInstructor from "../Components/Core/Home/OurInstructor";

const ONECourseDetail = () => {
  const { courseDetails } = useSelector((state) => state.Category);
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { CourseId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [totalLectures, setTotalLectures] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const cleanArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) {
      return data.flatMap((item) => {
        if (typeof item === "string") {
          try { return JSON.parse(item); } catch { return [item]; }
        }
        return item;
      });
    }
    return [];
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await dispatch(GetWholeCourseDetails(CourseId));
      setLoading(false);
    };
    fetchData();
  }, [CourseId, dispatch]);

  useEffect(() => {
    if (courseDetails) {
      const avg = GetAvgRating(courseDetails.ratingAndReviews);
      setAverageRating(avg || 0);
      if (courseDetails.courseContent) {
        const count = courseDetails.courseContent.reduce(
          (acc, sec) => acc + (sec.subSections?.length || 0),
          0
        );
        setTotalLectures(count);
      }
    }
  }, [courseDetails]);

  const handleShare = () => {
    copy(window.location.href);
    toast.success("Link copied to clipboard");
  };

  const handleAddCourseInCart = () => {
    if (!token) {
      toast.error("Please Login first");
      return navigate("/login");
    }
    if (user?.courses?.includes(CourseId)) {
      toast.error("Course already purchased");
      return;
    }
    dispatch(AddNewCouseInCart(CourseId, user._id, token, navigate));
  };

  if (loading)
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-green-500/10 border-t-green-500 rounded-full animate-spin" />
        <p className="text-gray-500 animate-pulse font-medium">Loading Experience...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-green-500/30 overflow-x-hidden">
      
      
      <div className="relative border-b border-white/10 bg-gradient-to-b from-green-500/5 to-transparent pt-20 md:pt-24 pb-12 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">
          
          
          <div className="lg:col-span-2 space-y-6 md:space-y-8 order-2 lg:order-1">
            <div className="space-y-4">
              <span className="px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs md:text-sm font-semibold border border-green-500/20 tracking-wide inline-block">
                BESTSELLER
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                {courseDetails.courseName}
              </h1>
              <p className="text-base md:text-lg text-gray-400 leading-relaxed max-w-2xl">
                {courseDetails.courseDescription}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 md:gap-6 items-center py-4 border-y border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-bold text-green-400">{averageRating.toFixed(1)}</span>
                <ReactStars count={5} value={averageRating} edit={false} size={18} color2="#10b981" />
                <span className="text-gray-500 text-xs md:text-sm">({courseDetails.ratingAndReviews?.length} ratings)</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2 text-gray-300 text-sm md:text-base">
                <FiUser className="text-green-500" />
                <span>{courseDetails.studentEnrolled?.length} Students</span>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-white/5 border border-white/10 w-fit">
              <img 
                src={courseDetails.instructor?.imageUrl} 
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-green-500/20" 
                alt="instructor"
              />
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Instructor</p>
                <p className="text-base md:text-lg font-semibold hover:text-green-400 transition-colors">
                  {courseDetails.instructor?.firstName} {courseDetails.instructor?.lastName}
                </p>
              </div>
            </div>
          </div>

          
          <div className="lg:sticky lg:top-28 z-10 order-1 lg:order-2">
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-green-500/5 group">
              <div className="relative overflow-hidden aspect-video">
                <img 
                  src={courseDetails.thumbnail} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt="thumbnail"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:opacity-100 transition-opacity">
                  <FiPlayCircle className="text-white drop-shadow-2xl text-5xl md:text-6xl" />
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="flex items-end gap-2">
                  <span className="text-3xl md:text-4xl font-bold">₹{courseDetails.price}</span>
                  <span className="text-gray-500 line-through mb-1 text-sm md:text-base">₹{courseDetails.price * 2}</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={handleAddCourseInCart}
                    className="w-full py-3.5 md:py-4 bg-white text-black font-bold rounded-xl hover:bg-green-500 hover:text-white transition-all transform active:scale-95"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full py-3 border border-white/10 rounded-xl flex justify-center items-center gap-2 text-sm font-medium hover:bg-white/5"
                  >
                    <FiShare2 /> Share Course
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16">
          
          <div className="lg:col-span-2 space-y-12 md:space-y-16">
            
            
            <section className="bg-[#0f0f0f] border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-inner">
              <h3 className="text-xl md:text-2xl font-bold mb-6 flex gap-3 items-center">
                <FiShield className="text-green-500" /> What you'll achieve
              </h3>
              <div className="flex flex-col gap-1">
                {cleanArray(courseDetails.whatYouWillLearn).map((item, i) => (
                  <div key={i} className="flex gap-4 p-3 md:p-4 rounded-xl hover:bg-white/5 transition-all group">
                    <FiCheckCircle className="text-green-500 mt-1 shrink-0 group-hover:scale-110 transition-transform" />
                    <p className="text-sm md:text-base text-gray-400 group-hover:text-gray-200 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            
            <section className="space-y-6 md:space-y-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">Course Content</h3>
                  
                </div>
                <button className="text-green-400 text-sm font-medium hover:underline text-left">Expand all sections</button>
              </div>
              <div className="border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden bg-[#0f0f0f]">
                <OverviewofLectures data={courseDetails.courseContent} />
              </div>
            </section>

            
            <section className="bg-[#0f0f0f] border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-inner">
              <h3 className="text-xl md:text-2xl font-bold mb-6 flex gap-3 items-center">
                <FiShield className="text-green-500" /> Candidate Requirements
              </h3>
              <div className="flex flex-col gap-1">
                {cleanArray(courseDetails.instructions).map((item, i) => (
                  <div key={i} className="flex gap-4 p-3 md:p-4 rounded-xl hover:bg-white/5 transition-all group">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2.5 shrink-0" />
                    <p className="text-sm md:text-base text-gray-400 group-hover:text-gray-200 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            
            <section className="bg-[#0f0f0f] border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-inner">
              <h3 className="text-xl md:text-2xl font-bold mb-6 flex gap-3 items-center">
                <FiTag className="text-green-500" /> This course includes
              </h3>
              <div className="flex flex-col gap-2">
                {cleanArray(courseDetails.tag).map((tag, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group">
                    <span className="text-green-500/50 font-mono text-lg">#</span>
                    <p className="text-sm md:text-base text-gray-400 group-hover:text-white font-medium">{tag}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>

      <OurInstructor/>

      <ModernFooter />
    </div>
  );
};

export default ONECourseDetail;