import React, { useState } from 'react';
import { TrendingUp, Shield, Zap, Wallet, LineChart, BarChart3, Users, ChevronDown } from 'lucide-react';

export default function CryptoLandingPage() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CoinMoney</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-purple-600">Home</a>
              <a href="#" className="text-gray-700 hover:text-purple-600">About</a>
              <a href="#" className="text-gray-700 hover:text-purple-600">Services</a>
              <a href="#" className="text-gray-700 hover:text-purple-600">Trade</a>
              <a href="#" className="text-gray-700 hover:text-purple-600">Sell Crypto</a>
              <a href="#" className="text-gray-700 hover:text-purple-600">Blog</a>
            </nav>

            <button className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Explore The <span style={{ color: '#413fbc' }}>Latest Digital</span>
            <br />Currency Values.
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Invest in USDT on Tron Network with real-time tracking and secure transactions
          </p>
          <div className="flex justify-center space-x-4">
            <button style={{ backgroundColor: '#413fbc' }} className="text-white px-8 py-3 rounded-lg hover:opacity-90 transition">
              Get Started
            </button>
            <button className="bg-white text-gray-900 px-8 py-3 rounded-lg border border-gray-300 hover:border-gray-400 transition">
              Free Trial
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6" style={{ color: '#413fbc' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">MD Isaz Miah</h3>
                  <p className="text-sm text-gray-500">Crypto Investor</p>
                </div>
              </div>
              <div className="mb-2">
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">$345,876.78</p>
              </div>
              <div className="flex space-x-2 mt-4">
                {[40, 60, 45, 70, 55, 65, 50, 75, 60].map((height, i) => (
                  <div key={i} style={{ backgroundColor: '#413fbc' }} className="w-8 rounded opacity-80" style={{ height: `${height}px`, backgroundColor: '#413fbc' }}></div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Total Revenue</h3>
                <span className="text-sm text-gray-500">This Year</span>
              </div>
              <div className="relative h-40">
                <svg viewBox="0 0 200 80" className="w-full h-full">
                  <path
                    d="M 0,60 Q 25,50 50,55 T 100,45 T 150,35 T 200,25"
                    fill="none"
                    stroke="#413fbc"
                    strokeWidth="3"
                  />
                  <path
                    d="M 0,60 Q 25,50 50,55 T 100,45 T 150,35 T 200,25 L 200,80 L 0,80 Z"
                    fill="#413fbc"
                    opacity="0.1"
                  />
                </svg>
              </div>
              <p className="text-right text-sm text-gray-600 mt-2">View Details →</p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex justify-center items-center space-x-8 mt-12 text-gray-400 flex-wrap">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span className="text-sm">Coinbase</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span className="text-sm">Ledger</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span className="text-sm">Tron Network</span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm">TRC-20 USDT</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">Binance</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-gray-500 mb-2">WHY US</p>
            <h2 className="text-4xl font-bold text-gray-900">
              Crypto Is The Leading
              <br />Platform For <span style={{ color: '#413fbc' }}>Crowdfunding!</span>
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Invest in USDT with confidence on the Tron Network. Fast transactions, low fees, and complete transparency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#413fbc' }}>
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Platform</h3>
              <p className="text-gray-600 text-sm">
                Your USDT investments are protected with bank-level security and blockchain transparency.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-Time Analytics</h3>
              <p className="text-gray-600 text-sm">
                Track your USDT portfolio with live market data and comprehensive analytics tools.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Transactions</h3>
              <p className="text-gray-600 text-sm">
                Experience lightning-fast USDT transfers on Tron Network with minimal fees.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <a href="#" className="text-sm font-semibold" style={{ color: '#413fbc' }}>Learn More →</a>
          </div>
        </div>
      </section>

      {/* Installation Manual Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-blue-800 rounded-3xl p-12 text-white">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                Refer To The Easy
                <br />Installation Manual
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#413fbc' }}>
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Crypto Marketplace</h3>
                <p className="text-sm text-gray-200">
                  Access real-time USDT prices on Tron Network with comprehensive market analysis.
                </p>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Buy digital currency</h3>
                <p className="text-sm text-gray-200">
                  Purchase USDT instantly with multiple payment methods and start investing today.
                </p>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
                <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-4">
                  <LineChart className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Sell digital currency</h3>
                <p className="text-sm text-gray-200">
                  Convert your USDT to fiat currency quickly with competitive rates and low fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-sm font-semibold text-gray-500 mb-2">OUR ANALYTIC</p>
            <div className="flex justify-between items-center">
              <h2 className="text-4xl font-bold text-gray-900">
                In-Depth Look At
                <br /><span style={{ color: '#413fbc' }}>Cryptocurrency</span> Choices.
              </h2>
              <a href="#" className="text-sm font-semibold" style={{ color: '#413fbc' }}>Learn More →</a>
            </div>
            <p className="text-gray-600 mt-4 max-w-2xl">
              Monitor your USDT investments with detailed analytics, market trends, and portfolio insights on the Tron Network.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm text-gray-600 mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-gray-900 mb-4">$345,876.78</p>
              <div className="flex space-x-2">
                {[45, 65, 50, 70, 55, 75, 60, 80, 65, 70].map((height, i) => (
                  <div key={i} className="flex-1 rounded-t" style={{ backgroundColor: '#413fbc', height: `${height}px` }}></div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6" style={{ color: '#413fbc' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">MD Isaz Miah</h3>
                    <p className="text-sm text-gray-500">Crypto Investor</p>
                  </div>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">$345,876.78</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm text-gray-600 mb-2">Cryptocurrency Listing</h3>
              <p className="text-2xl font-bold text-gray-900 mb-4">$345,876.78</p>
              <p className="text-sm text-gray-500">Total USDT Holdings on Tron Network</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm text-gray-600 mb-2">Recent Makers</h3>
              <p className="text-2xl font-bold text-gray-900 mb-4">$49,979.36</p>
              <div className="h-20 relative">
                <svg viewBox="0 0 150 60" className="w-full h-full">
                  <path
                    d="M 0,40 L 20,35 L 40,45 L 60,30 L 80,40 L 100,25 L 120,35 L 150,20"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm text-gray-600 mb-2">Crypto Exchange</h3>
              <p className="text-2xl font-bold text-gray-900 mb-4">$49,979.36</p>
              <div className="grid grid-cols-6 gap-1 h-20">
                {Array.from({length: 24}).map((_, i) => (
                  <div key={i} className={`rounded ${i % 3 === 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl p-6 text-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-sm opacity-90 mb-1">Digital Wallet</h3>
                  <p className="text-2xl font-bold">$345,876.78</p>
                </div>
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg"></div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-90">USDT Balance</span>
                  <span>***</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm text-gray-600 mb-4">Trading Patterns</h3>
              <div className="space-y-3">
                {[60, 80, 45, 70].map((width, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ backgroundColor: '#413fbc', width: `${width}%` }}></div>
                    </div>
                    <span className="text-sm text-gray-600">{width}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm text-gray-600 mb-4">Trading Exchange</h3>
              <div className="h-32 flex items-end space-x-1">
                {[40, 60, 45, 70, 55, 65, 50, 75, 60, 55, 70, 50].map((height, i) => (
                  <div key={i} className="flex-1 rounded-t" style={{ backgroundColor: i % 2 === 0 ? '#10B981' : '#EF4444', height: `${height}%` }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">
              Frequently Asked <span style={{ color: '#413fbc' }}>Questions</span>
            </h2>
            <p className="text-gray-600 mt-4">
              Get quick answers about investing in USDT on the Tron Network through our platform
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "So, What Is The Best Way To Get Started?",
                a: "Getting started is easy! Create an account, verify your identity, and you can start investing in USDT on the Tron Network within minutes. Our platform guides you through each step."
              },
              {
                q: "Where Do I See How To Buy More Crypto?",
                a: "Navigate to the 'Buy Crypto' section in your dashboard. You'll find multiple payment options and can purchase USDT using credit cards, bank transfers, or other cryptocurrencies."
              },
              {
                q: "Do I Get To Utilize Arbitrage With Crypto?",
                a: "Yes, our platform supports arbitrage opportunities. Monitor price differences across exchanges and execute trades quickly to maximize your USDT investments."
              },
              {
                q: "How Do I Lock Up My Trading Account?",
                a: "Enable two-factor authentication, set up withdrawal whitelists, and use our advanced security features to protect your account and USDT holdings."
              },
              {
                q: "What Kind Of Data Should I Input When Invited?",
                a: "You'll need to provide basic identification information, proof of address, and set up your preferred payment methods for buying and selling USDT."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left"
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${activeFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-gray-500 mb-2">TESTIMONIALS</p>
            <div className="flex justify-between items-center max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900">
                What Our <span style={{ color: '#413fbc' }}>Clients Say</span>
              </h2>
              <a href="#" className="text-sm font-semibold" style={{ color: '#413fbc' }}>Read All Review →</a>
            </div>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Hear from our community of USDT investors who trust our platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 text-white">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-20 h-20 bg-gray-300 rounded-2xl flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Harold Howard</h3>
                  <p className="text-sm opacity-80">Crypto Enthusiast</p>
                </div>
              </div>
              <p className="leading-relaxed">
                "I've been using this platform for over 6 months. The experience was seamless from registration to trading. The USDT on Tron Network integration is fantastic - fast transactions and low fees. The real-time analytics help me make informed decisions, and the customer support is always available when I need help. Highly recommend for anyone serious about crypto investing!"
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-20 h-20 bg-gray-300 rounded-2xl flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">Sarah Mitchell</h3>
                  <p className="text-sm text-gray-500">Day Trader</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                "As a day trader, I need a platform that's fast and reliable. This crypto exchange delivers on both fronts. The USDT liquidity on Tron is excellent, and I can execute trades instantly. The interface is intuitive, making it easy to track my portfolio. Security features give me peace of mind knowing my investments are protected."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* News & Insights */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-gray-500 mb-2">BLOG</p>
            <h2 className="text-4xl font-bold text-gray-900">
              Our Recent <span style={{ color: '#413fbc' }}>News & Insights</span>
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Expert crypto investment tips, market insights, and the latest updates about USDT on Tron Network
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <div className="w-24 h-24 bg-yellow-500 rounded-full opacity-80"></div>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <span className="px-3 py-1 bg-purple-100 rounded" style={{ color: '#413fbc' }}>Trading</span>
                  <span>Sarah Smith</span>
                  <span>Sep 12, 2025</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  TRC-20 (USDT) Becomes Second Most Used Stable
                </h3>
                <p className="text-gray-600 text-sm">
                  USDT on the Tron Network continues to gain popularity due to fast transactions and low fees...
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 flex space-x-4 shadow-sm hover:shadow-md transition">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                    <span className="px-2 py-1 bg-purple-100 rounded" style={{ color: '#413fbc' }}>Trading</span>
                    <span>Sarah Smith</span>
                    <span>Sep 12, 2025</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    New Capital Of Your Crypto Banking And Inst Evolution
                  </h3>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 flex space-x-4 shadow-sm hover:shadow-md transition">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-300 to-cyan-500 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white bg-opacity-30 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                    <span className="px-2 py-1 bg-purple-100 rounded" style={{ color: '#413fbc' }}>Economy</span>
                    <span>Sarah Smith</span>
                    <span>Sep 12, 2025</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    Crypto Market Tried Of Special Of Interest Rate
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5" style={{ color: '#413fbc' }} />
                </div>
                <span className="text-xl font-bold">CoinMoney</span>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                Your trusted platform for USDT investments on Tron Network. Fast, secure, and transparent crypto trading.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Blockchain</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Stablecoins</a></li>
                <li><a href="#" className="hover:text-white">Binance</a></li>
                <li><a href="#" className="hover:text-white">Ethereum</a></li>
                <li><a href="#" className="hover:text-white">Tron Network</a></li>
                <li><a href="#" className="hover:text-white">Bitcoin</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Pages</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Career</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Email: support@coinmoney.com</li>
                <li>Phone: +1 234 567 8900</li>
                <li>Address: 123 Crypto Street</li>
                <li>Harare, Zimbabwe</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white border-opacity-10 mt-12 pt-8 text-center text-sm text-gray-300">
            <p>© 2025 CoinMoney. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
}