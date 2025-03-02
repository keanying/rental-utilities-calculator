import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Zap, ClipboardList, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const HomePage = () => {
  return (
    <div className="space-y-8 pb-8">
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            租房水电费<span className="text-primary">简单计算</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-prose mx-auto mb-8">
            告别复杂计算，轻松管理租房水电费，为您提供公平、透明的费用分摊方案。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link to="/water-bill">
                <Droplets className="h-5 w-5" />
                计算水费
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link to="/electricity-bill">
                <Zap className="h-5 w-5" />
                计算电费
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">功能介绍</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="p-2 w-fit rounded-full bg-blue-100 dark:bg-blue-900/30 mb-2">
                  <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>水费计算</CardTitle>
                <CardDescription>
                  按照居住天数和人数进行水费分摊
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>根据每个住户的实际居住天数，公平计算每位住户应付的水费金额，支持多房间、多住户的复杂场景。</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="gap-2">
                  <Link to="/water-bill">
                    开始计算 
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="p-2 w-fit rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-2">
                  <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <CardTitle>电费计算</CardTitle>
                <CardDescription>
                  按照房间使用情况分摊电费
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>基于房间的使用天数计算电费，自动处理多租户场景下的电费分摊问题，让电费分配更加公平合理。</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="gap-2">
                  <Link to="/electricity-bill">
                    开始计算
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="p-2 w-fit rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
                  <ClipboardList className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>历史记录</CardTitle>
                <CardDescription>
                  保存并查看历史计算结果
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>自动保存所有计算结果，支持查看和管理历史记录，方便随时回顾过往的水电费计算详情。</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="gap-2">
                  <Link to="/history">
                    查看历史
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
      
      <section className="py-8 bg-accent/50 rounded-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">开始使用租房水电费计算器</h2>
            <p className="mb-6 text-muted-foreground">
              无需注册，免费使用，让水电费分摊变得简单、公平、透明。
            </p>
            <Button asChild size="lg">
              <Link to="/water-bill">立即开始使用</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;