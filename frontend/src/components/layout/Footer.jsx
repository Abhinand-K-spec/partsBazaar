import { Link } from 'react-router-dom';
import { Wrench, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 border-t border-gray-800 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                                <Wrench className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-white text-lg leading-none">PartsBazaar</p>
                                <p className="text-xs text-blue-400 leading-none">Spare Parts Marketplace</p>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed mb-4">
                            India's trusted marketplace for rare and common smartphone spare parts. Trusted by 10,000+ repair technicians.
                        </p>
                        <div className="flex flex-col gap-2 text-xs">
                            <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-blue-400" /> +91 98765 43210</span>
                            <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-blue-400" /> support@partsbazaar.in</span>
                            <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-blue-400" /> Mumbai, Maharashtra</span>
                        </div>
                    </div>

                    {/* Parts */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Browse Parts</h4>
                        <ul className="space-y-2 text-sm">
                            {['Displays & Screens', 'Batteries', 'Charging Ports', 'Cameras', 'Speakers', 'Back Covers', 'Rare Parts'].map(item => (
                                <li key={item}>
                                    <Link to="/search" className="hover:text-blue-400 transition-colors flex items-center gap-1">
                                        <ArrowRight className="w-3 h-3" /> {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Brands */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Top Brands</h4>
                        <ul className="space-y-2 text-sm">
                            {['Apple iPhone Parts', 'Samsung Parts', 'Xiaomi / Redmi Parts', 'Oppo Parts', 'Vivo Parts', 'OnePlus Parts', 'Nokia Parts'].map(item => (
                                <li key={item}>
                                    <Link to="/search" className="hover:text-blue-400 transition-colors flex items-center gap-1">
                                        <ArrowRight className="w-3 h-3" /> {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            {['About Us', 'For Repair Technicians', 'Bulk Orders', 'Returns & Warranty', 'Privacy Policy', 'Terms of Service', 'Contact Us'].map(item => (
                                <li key={item}>
                                    <a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-1">
                                        <ArrowRight className="w-3 h-3" /> {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <p>© 2025 PartsBazaar. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-green-400"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Secure Payments</span>
                        <span className="flex items-center gap-1.5 text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Genuine Parts</span>
                        <span className="flex items-center gap-1.5 text-orange-400"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> Fast Shipping</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
