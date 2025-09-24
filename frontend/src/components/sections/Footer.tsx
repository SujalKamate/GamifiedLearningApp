"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">EVOLV</span>
            </div>
            <p className="text-muted-foreground max-w-sm">
              Gamified adaptive learning for coding, vocabulary, and finance. 
              AI-powered challenges with analytics and anti-cheat protection.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="#"><Facebook className="h-4 w-4" /></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="#"><Twitter className="h-4 w-4" /></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="#"><Instagram className="h-4 w-4" /></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="#"><Youtube className="h-4 w-4" /></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="#"><Linkedin className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/challenges" className="hover:text-primary transition-colors">Challenges</Link></li>
              <li><Link href="/analytics" className="hover:text-primary transition-colors">Analytics</Link></li>
              <li><Link href="/profile" className="hover:text-primary transition-colors">Profile</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Download</h3>
            <p className="text-muted-foreground mb-4">Get EVOLV on your device</p>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="#">Download on App Store</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="#">Get on Google Play</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 EVOLV. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;