import React, { useState } from 'react'
import SignupWizard from './SignupForm'
import RoleSelector from '@/components/pages/signup/RoleSelector'

export default function SignUpPage() {
  const [selectedRole, setSelectedRole] = useState(null)

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        {!selectedRole ? (
          <RoleSelector onSelectRole={setSelectedRole} />
        ) : (
            <SignupWizard role={selectedRole} onBack={()=>setSelectedRole(null)}/>
        )}
      </div>
    </main>
  )
}
