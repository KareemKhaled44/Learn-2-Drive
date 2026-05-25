import { useState } from 'react'
import { Send } from 'lucide-react'
import api from '../exports/Axios'

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setStatus(null)

    try {
      await api.post('/api/contact-messages/', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      })
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })
      setStatus({ type: 'success', message: 'Message sent successfully.' })
    } catch (err) {
      const apiMessage = err.response?.data
      const fallback = 'Unable to send your message. Please try again.'
      setStatus({
        type: 'error',
        message: typeof apiMessage === 'string' ? apiMessage : fallback,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white uppercase tracking-tight px-2">
            Contact <span className="text-[#22d3ee]">LEARN </span>2<span className="text-[#22d3ee]"> DRIVE</span>
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-gray-300 max-w-3xl mx-auto px-4">
            Get in touch with our team for inquiries, support, or to schedule your driving lessons
          </p>
        </div>

        {/* Contact Form */}
        <div className="flex justify-center px-2 sm:px-0">
          <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-6 sm:p-8 md:p-10 w-full sm:w-11/12 md:w-10/12 lg:w-3/4 xl:w-2/3">
            <h3 className="text-xl sm:text-2xl font-bold text-[#22d3ee] mb-4 sm:mb-6">Send Us a Message</h3>

            {status && (
              <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${status.type === 'success' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-red-400/30 bg-red-400/10 text-red-200'}`}>
                {status.message}
              </div>
            )}

            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row sm:gap-5 space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                  placeholder="+20 123 456 7890"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                  placeholder="What's this about?"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1 sm:mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#0f172a] border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                  placeholder="Your message here..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-[#22d3ee] text-white font-medium rounded-lg hover:bg-[#1e40af] transition duration-300 mt-2 sm:mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactUs