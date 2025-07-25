import React from 'react'
import video01 from "../assets/video01.mp4";
import video02 from "../assets/video02.mp4";
const HeroSection = () => {
  return (
    <div className="flex flex-col items-center mt-6 lg:mt-20">
        <h1 className="text-4x  sm:text-6xl lg:text-7xl text-center tracking-wide">
        Harvesting the future of farming with  
        <span className='bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text'> AI-driven precision</span>
        </h1>
        <p className='mt-10 text-lg text-center text-neutral-500 max-w-4xl '>
        Leverage advanced AI technology to accurately predict crop diseases before they spread. Enhance your farming efficiency, reduce losses, and ensure healthier yields with our intelligent disease prediction system.
        </p>
        <div className="flex justify-center my-10">
            <a href="#" className="bg-gradient-to-r from-orange-500 to-orange-800 px-2 py-3 rounded-md">Know More</a>
            <a href="#" className='py-3 px-4 mx-3 rounded-md border'>
                Documentation
            </a>
        </div>
        <div className="flex mt-10 justify-center">
            <video autoPlay loop muted  className='rounded-lg w-1/2 border-orange-700 shadow-orange-400 mx-2 my-4'>
            <source src={video01} type='video/mp4' />
            Browser doesnt support video
            </video>
            <video autoPlay loop muted  className='rounded-lg w-1/2 border-orange-700 shadow-orange-400 mx-2 my-4'>
            <source src={video02} type='video/mp4' />
            Browser doesnt support video
            </video>
        </div>
    </div>
  )
}

export default HeroSection