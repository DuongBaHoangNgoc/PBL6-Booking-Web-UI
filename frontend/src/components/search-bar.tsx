"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Users, Search } from "lucide-react"

export function SearchBar() {
    const [destination, setDestination] = useState("")
    const [checkIn, setCheckIn] = useState("")
    const [checkOut, setCheckOut] = useState("")
    const [travelers, setTravelers] = useState("1")

    return (
        <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
                <div className="bg-card rounded-lg shadow-lg p-6 md:p-8 -mt-20 relative z-10">
                    <h2 className="text-2xl font-bold mb-6 text-foreground">Find Your Perfect Tour</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Destination */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-foreground mb-2">Destination</label>
                            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Where to?"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="flex-1 outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>

                        {/* Check In */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-foreground mb-2">Check In</label>
                            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <input
                                    type="date"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                    className="flex-1 outline-none bg-transparent text-foreground"
                                />
                            </div>
                        </div>

                        {/* Check Out */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-foreground mb-2">Check Out</label>
                            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <input
                                    type="date"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    className="flex-1 outline-none bg-transparent text-foreground"
                                />
                            </div>
                        </div>

                        {/* Travelers */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-foreground mb-2">Travelers</label>
                            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <select
                                    value={travelers}
                                    onChange={(e) => setTravelers(e.target.value)}
                                    className="flex-1 outline-none bg-transparent text-foreground"
                                >
                                    {[1, 2, 3, 4, 5, 6].map((num) => (
                                        <option key={num} value={num}>
                                            {num} {num === 1 ? "Person" : "People"}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Search Button */}
                        <div className="flex flex-col justify-end">
                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                                <Search className="w-4 h-4" />
                                Search
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
