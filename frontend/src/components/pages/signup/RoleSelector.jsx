import React from 'react'
import { Building2, MapPin } from 'lucide-react'

export default function RoleSelector({ onSelectRole }) {
  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
          Join Our Community
        </h1>
        <p className="text-lg text-gray-500">
          Choose your account type to get started
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Tour Operator Card */}
        <button
          onClick={() => onSelectRole('supplier')}
          className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 p-8 text-left transition-all duration-300 hover:border-blue-500 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tour Operator</h2>

            <p className="text-gray-600 mb-6">
              Create and manage tour packages, connect with travelers, and grow your business
            </p>

            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">✓</span>
                Create and manage tours
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">✓</span>
                Track bookings and revenue
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">✓</span>
                Reach millions of travelers
              </li>
            </ul>
          </div>
        </button>

        {/* Traveler Card */}
        <button
          onClick={() => onSelectRole('user')}
          className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 p-8 text-left transition-all duration-300 hover:border-blue-500 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Traveler</h2>

            <p className="text-gray-600 mb-6">
              Discover amazing tours, book adventures, and create unforgettable memories
            </p>

            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">✓</span>
                Browse curated tours
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">✓</span>
                Easy booking process
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-blue-600">✓</span>
                Manage your trips
              </li>
            </ul>
          </div>
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-gray-500 mt-8">
        Already have an account?{' '}
        <a href="/auth/login" className="font-semibold text-blue-600 hover:underline">
          Sign in
        </a>
      </p>
    </div>
  )
}
