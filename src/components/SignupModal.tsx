import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  listingUrl: string;
  keyword: string;
  keyword2: string;
  keyword3: string;
  name: string;
  email: string;
  whatsapp: string;
}

// HubSpot credentials
const HUBSPOT_PORTAL_ID = '48846766';
const HUBSPOT_FORM_ID = 'd8187ec1-80b4-4a3a-a23e-ca2a51d97f4d';

export function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [whatsAppRedirectUrl, setWhatsAppRedirectUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    listingUrl: '',
    keyword: '',
    keyword2: '',
    keyword3: '',
    name: '',
    email: '',
    whatsapp: '',
  });

  const handleOpenWhatsApp = () => {
    // Track Contact event with Meta Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Contact');
    }
    
    if (whatsAppRedirectUrl) {
      window.open(whatsAppRedirectUrl, '_blank');
      
      // Close modal and reset after opening WhatsApp
      onClose();
      setStep(1);
      setSubmissionSuccess(false);
      setWhatsAppRedirectUrl('');
      setFormData({
        listingUrl: '',
        keyword: '',
        keyword2: '',
        keyword3: '',
        name: '',
        email: '',
        whatsapp: '',
      });
    }
  };

  const validateEtsyUrl = (url: string): boolean => {
    const trimmedUrl = url.trim().toLowerCase();
    if (!trimmedUrl.includes('etsy.com/listing/')) {
      return false;
    }

    return true;
  };

  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUrlError(null);

    if (!validateEtsyUrl(formData.listingUrl)) {
      setUrlError('Please enter a valid Etsy listing URL (must contain "etsy.com/listing/")');
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          submittedAt: Date.now(),
          fields: [
            {
              objectTypeId: '0-1',
              name: 'etsy_listing_url',
              value: formData.listingUrl
            },
            {
              objectTypeId: '0-1',
              name: 'target_keyword',
              value: formData.keyword
            },
            {
              objectTypeId: '0-1',
              name: 'keyword_2',
              value: formData.keyword2
            },
            {
              objectTypeId: '0-1',
              name: 'keyword_3',
              value: formData.keyword3
            },
            {
              objectTypeId: '0-1',
              name: 'firstname',
              value: formData.name
            },
            {
              objectTypeId: '0-1',
              name: 'email',
              value: formData.email
            },
            {
              objectTypeId: '0-1',
              name: 'hs_whatsapp_phone_number',
              value: formData.whatsapp
            }
          ],
          context: {
            hutk: document.cookie.match(/hubspotutk=(.*?);/)?.[1] || undefined,
            pageUri: window.location.href,
            pageName: document.title
          }
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Submission failed');
      }

      // Track Lead event with Meta Pixel
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Lead', {
          value: 35,
          currency: 'USD',
        });
      }

      // Construct WhatsApp message and URL for later use
      const message = `listing id: ${formData.listingUrl}
keyword 1: ${formData.keyword}
keyword 2: ${formData.keyword2}
keyword 3: ${formData.keyword3}
name: ${formData.name}
email: ${formData.email}
whatsapp: ${formData.whatsapp}`;

      // URL encode the message
      const encodedMessage = encodeURIComponent(message);
      
      // Construct WhatsApp URL and store it
      const whatsappUrl = `https://wa.me/+13057966231?text=${encodedMessage}`;
      setWhatsAppRedirectUrl(whatsappUrl);
      
      // Show success state
      setSubmissionSuccess(true);

    } catch (error) {
      console.error('Error submitting form:', error);
      setError('There was an error submitting your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // PAYMENT FUNCTIONALITY - HIDDEN BUT PRESERVED FOR LATER USE
  // const handleContinueToPayment = () => {
  //   // Track InitiateCheckout event with Meta Pixel
  //   if (typeof window !== 'undefined' && window.fbq) {
  //     window.fbq('track', 'InitiateCheckout', {
  //       value: 35,
  //       currency: 'USD',
  //     });
  //   }

  //   // Open new payment page in new tab
  //   window.open('https://payments-na1.hubspot.com/payments/qWyhzjgTVKqjxGQ?referrer=PAYMENT_LINK', '_blank');
  //   
  //   // Close modal and reset
  //   onClose();
  //   setStep(1);
  //   setFormData({
  //     listingUrl: '',
  //     keyword: '',
  //     name: '',
  //     email: '',
  //     whatsapp: '',
  //   });
  // };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#161618] rounded-xl w-full max-w-md relative border border-[#ff5702]/10">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6">
          {submissionSuccess ? (
            <div className="text-center space-y-6">
              <div className="bg-transparent border-0 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">✅ Information Submitted Successfully!</h3>
                <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-4 mt-3">
                  <p className="text-lg font-bold text-green-400 mb-2">
                    IMPORTANT NEXT STEP:
                  </p>
                  <p className="text-base font-semibold text-white">
                    Click the button below to instantly check if your shop qualifies for a FREE trial.
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleOpenWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-lg"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Open WhatsApp Chat
              </button>
              
              <p className="text-xs text-gray-500">
                You'll be redirected to WhatsApp after clicking.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-[#ff5702]">
                {step === 1 ? 'RANK YOUR PRODUCT ON PAGE 1' : 'Get a WhatsApp update after we successfully ranked your listing on page 1'}
              </h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}
              
              {step === 1 ? (
                <form onSubmit={handleSubmitStep1} className="space-y-4">
                  <div>
                    <label htmlFor="listingUrl" className="block text-sm font-medium text-gray-300 mb-1">
                      Etsy Listing URL
                    </label>
                    <input
                      type="text"
                      id="listingUrl"
                      required
                      placeholder="www.etsy.com/listing/123456789"
                      className={`w-full px-4 py-2 bg-[#1F1F21] border rounded-lg focus:outline-none focus:border-[#ff5702] text-white ${
                        urlError ? 'border-red-500' : 'border-gray-700'
                      }`}
                      value={formData.listingUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, listingUrl: e.target.value });
                        setUrlError(null);
                        e.target.setCustomValidity('');
                      }}
                      onInvalid={(e) => {
                        e.currentTarget.setCustomValidity('This field is required');
                      }}
                    />
                    {urlError && (
                      <p className="mt-2 text-sm text-red-500">{urlError}</p>
                    )}
                  </div>

                  <div className="border-t border-gray-700 pt-4 mt-6">
                    <h3 className="text-base font-semibold text-white mb-4">
                      List 3 Options For Us To Choose From
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="keyword" className="block text-sm font-medium text-gray-300 mb-1">
                          Keyword Option #1
                        </label>
                        <input
                          type="text"
                          id="keyword"
                          required
                          placeholder="e.g., gold vintage necklace"
                          className="w-full px-4 py-2 bg-[#1F1F21] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff5702] text-white"
                          value={formData.keyword}
                          onChange={(e) => {
                            setFormData({ ...formData, keyword: e.target.value });
                            e.target.setCustomValidity('');
                          }}
                          onInvalid={(e) => {
                            e.currentTarget.setCustomValidity('This field is required');
                          }}
                        />
                      </div>
                      <div>
                        <label htmlFor="keyword2" className="block text-sm font-medium text-gray-300 mb-1">
                          Keyword Option #2
                        </label>
                        <input
                          type="text"
                          id="keyword2"
                          required
                          placeholder="e.g., black leather wallet"
                          className="w-full px-4 py-2 bg-[#1F1F21] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff5702] text-white"
                          value={formData.keyword2}
                          onChange={(e) => {
                            setFormData({ ...formData, keyword2: e.target.value });
                            e.target.setCustomValidity('');
                          }}
                          onInvalid={(e) => {
                            e.currentTarget.setCustomValidity('This field is required');
                          }}
                        />
                      </div>
                      <div>
                        <label htmlFor="keyword3" className="block text-sm font-medium text-gray-300 mb-1">
                          Keyword Option #3
                        </label>
                        <input
                          type="text"
                          id="keyword3"
                          required
                          placeholder="e.g., digital wedding planner"
                          className="w-full px-4 py-2 bg-[#1F1F21] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff5702] text-white"
                          value={formData.keyword3}
                          onChange={(e) => {
                            setFormData({ ...formData, keyword3: e.target.value });
                            e.target.setCustomValidity('');
                          }}
                          onInvalid={(e) => {
                            e.currentTarget.setCustomValidity('This field is required');
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-6 bg-[#ff5702] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
                  >
                    Continue
                  </button>
                </form>
              ) : step === 2 ? (
                <form onSubmit={handleFinalSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-2 bg-[#1F1F21] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff5702] text-white"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        e.target.setCustomValidity('');
                      }}
                      onInvalid={(e) => {
                        e.currentTarget.setCustomValidity('This field is required');
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      placeholder="john@example.com"
                      className="w-full px-4 py-2 bg-[#1F1F21] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff5702] text-white"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        e.target.setCustomValidity('');
                      }}
                      onInvalid={(e) => {
                        e.currentTarget.setCustomValidity('This field is required');
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-300 mb-1">
                      WhatsApp Number (with country code)
                    </label>
                    <input
                      type="tel"
                      id="whatsapp"
                      required
                      pattern="^\+[1-9]\d{1,14}$"
                      placeholder="+1234567890"
                      className="w-full px-4 py-2 bg-[#1F1F21] border border-gray-700 rounded-lg focus:outline-none focus:border-[#ff5702] text-white"
                      value={formData.whatsapp}
                      onChange={(e) => {
                        setFormData({ ...formData, whatsapp: e.target.value });
                        e.target.setCustomValidity('');
                      }}
                      onInvalid={(e) => {
                        e.currentTarget.setCustomValidity('This field is required');
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full mt-6 bg-[#ff5702] text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </form>
              ) : null}
            </>
          )}
          
          {/* PAYMENT STEP - HIDDEN BUT PRESERVED FOR LATER USE */}
          {/* {step === 3 && (
            <div className="text-center space-y-6">
              <div className="bg-[#1F1F21] p-4 rounded-lg border border-[#ff5702]/20">
                <h3 className="font-semibold text-white mb-2">Order Summary</h3>
                <div className="text-sm text-gray-400 space-y-1">
                  <p><span className="text-gray-300">Product:</span> {formData.listingUrl}</p>
                  <p><span className="text-gray-300">Keyword:</span> {formData.keyword}</p>
                  <p><span className="text-gray-300">Price:</span> $35</p>
                </div>
              </div>
              
              <button
                onClick={handleContinueToPayment}
                className="w-full bg-[#ff5702] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                Continue to Payment
              </button>
              
              <p className="text-xs text-gray-500">
                You'll be redirected to our secure payment page to complete your order.
              </p>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}