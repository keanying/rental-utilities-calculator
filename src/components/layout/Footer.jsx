import React from 'react';
import { Droplets, Zap, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t bg-accent/20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="font-bold text-lg mr-2">租房日记</div>
            <div className="text-sm text-muted-foreground">水电费计算系统</div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Droplets className="h-4 w-4 mr-1" />
              <span>简单水费计算</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Zap className="h-4 w-4 mr-1" />
              <span>公平电费分摊</span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 text-sm text-muted-foreground">
            <div className="flex items-center">
              <a 
                href="https://github.com/keanying/rental-utilities-calculator"
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center hover:text-primary transition-colors"
              >
                <Github className="h-4 w-4 mr-1" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 租房日记 - 水电费计算系统</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;