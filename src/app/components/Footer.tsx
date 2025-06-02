import React from 'react'

const Footer = () => {
  return (
    <footer className="row-start-3 mt-12 flex gap-[24px] flex-wrap items-center justify-center">
        <div className="text-gray-500 text-sm font-mono">
            &copy; {new Date().getFullYear()} openprofile. All rights reserved.
        </div>
    </footer>
  )
}

export default Footer