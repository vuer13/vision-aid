import Link from 'next/link'
import React from 'react'

const Navbar = () => {
    return (
        <div>
            <nav>
                <Link href='/'>
                    VisionAid
                </Link>

                <div>
                    <Link href='/home'>Home</Link>
                    <Link href='/tracker'>Tracker</Link>
                    <Link href='/symptom'>Symptoms</Link>
                    <Link href='/setting'>Settings</Link>
                </div>
            </nav>
        </div>
    )
}

export default Navbar