import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { createNotification } from "../notifications/notificationHelpers";
import { validateKYCData, validateFileSize, validateFileType, sanitizeInput } from "@/components/utils/validation";
import LiveFaceCapture from "./LiveFaceCapture";

const DOCUMENT_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID' },
  { value: 'drivers_license', label: 'Driver\'s License' },
  { value: 'residence_permit', label: 'Residence Permit' }
];

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 
  'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden',
  'Norway', 'Denmark', 'Finland', 'Poland', 'Czech Republic', 'Portugal', 'Ireland',
  'Japan', 'South Korea', 'Singapore', 'Hong Kong', 'China', 'India', 'Thailand',
  'Malaysia', 'Indonesia', 'Philippines', 'Vietnam', 'Brazil', 'Mexico', 'Argentina',
  'Chile', 'Colombia', 'Peru', 'United Arab Emirates', 'Saudi Arabia', 'Qatar',
  'South Africa', 'Nigeria', 'Kenya', 'Ethiopia', 'Ghana', 'Egypt', 'Morocco',
  'Turkey', 'Israel', 'Russia', 'Ukraine', 'New Zealand'
].sort();

export default function KYCSubmissionModal({ open, onOpenChange, profile }) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [documentType, setDocumentType] = useState('passport');
  const [documentNumber, setDocumentNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [proofOfAddressFile, setProofOfAddressFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const uploadFile = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    const result = await base44.integrations.Core.UploadFile({ file });
    return result.file_url;
  };

  const submitKYC = useMutation({
    mutationFn: async (data) => {
      setUploading(true);
      
      // Upload documents
      const frontUrl = await uploadFile(data.frontFile, 'front');
      const backUrl = data.backFile ? await uploadFile(data.backFile, 'back') : null;
      const selfieUrl = await uploadFile(data.selfieFile, 'selfie');
      const proofOfAddressUrl = await uploadFile(data.proofOfAddressFile, 'proof_of_address');

      // Use AI to verify documents
      const verificationResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Perform comprehensive KYC/AML verification analysis:

**Applicant Information:**
- Full Name: ${data.fullName}
- Date of Birth: ${data.dateOfBirth}
- Nationality: ${data.nationality}
- Document Type: ${data.documentType}
- Document Number: ${data.documentNumber}
- Address: ${data.address}, ${data.city}, ${data.postalCode}, ${data.country}
- Phone: ${data.phoneNumber}

**Documents Provided:**
1. ID Front (${data.documentType})
2. ID Back (if applicable)
3. Selfie with Document
4. Proof of Address

**Verification Checklist:**

**Identity Document Analysis:**
- Check document authenticity (security features, holograms, watermarks, fonts, layout)
- Verify document is not expired (check expiry date if visible)
- Confirm document quality (clear, not blurry, no tampering signs)
- Validate personal information matches (name, DOB, document number)
- Check for signs of forgery or manipulation

**Selfie Verification:**
- Verify face matches ID photo
- Confirm person is holding the actual document (not a photo)
- Check lighting and quality (not blurry, clear facial features)
- Verify liveness indicators (not a printed photo)

**Proof of Address:**
- Verify address document is recent (within 3 months)
- Confirm name matches applicant
- Check address matches provided information
- Validate document type (utility bill, bank statement, etc.)

**Consistency Checks:**
- Name consistency across all documents
- Date of birth matches declared age
- Address information aligns across documents
- Photo consistency between ID and selfie

**Risk Assessment:**
- Age verification (must be 18+)
- High-risk jurisdictions check
- Occupation/source of funds plausibility
- Overall profile risk assessment

**AML/Compliance:**
- No PEP (Politically Exposed Person) indicators
- No sanctions list matches
- Age verification (must be 18+)

Provide detailed verification with clear recommendation.`,
        response_json_schema: {
          type: "object",
          properties: {
            risk_level: { type: "string", enum: ["low", "medium", "high"] },
            decision: { type: "string", enum: ["auto_approve", "flag_review", "reject"] },
            confidence: { type: "number" },
            findings: { type: "array", items: { type: "string" } },
            red_flags: { type: "array", items: { type: "string" } },
            document_authenticity: { type: "string", enum: ["genuine", "suspected_forgery", "inconclusive"] },
            face_match: { type: "boolean" },
            address_verified: { type: "boolean" },
            age_verification: { type: "string" },
            recommendation: { type: "string" },
            manual_review_reason: { type: "string" }
          }
        },
        file_urls: [frontUrl, backUrl, selfieUrl, proofOfAddressUrl].filter(Boolean)
      });

      // Determine status based on AI analysis
      let newStatus = 'pending';
      let flagged = false;
      
      if (verificationResult.decision === 'auto_approve' && verificationResult.risk_level === 'low') {
        newStatus = 'verified';
      } else if (verificationResult.decision === 'reject' && verificationResult.risk_level === 'high') {
        newStatus = 'rejected';
      } else {
        newStatus = 'pending';
        flagged = true;
      }

      // Update user profile
      await base44.entities.UserProfile.update(profile.id, {
        kyc_status: newStatus,
        kyc_documents: {
          document_type: data.documentType,
          document_number: data.documentNumber,
          full_name: data.fullName,
          date_of_birth: data.dateOfBirth,
          nationality: data.nationality,
          address: data.address,
          city: data.city,
          postal_code: data.postalCode,
          country: data.country,
          phone_number: data.phoneNumber,
          front_url: frontUrl,
          back_url: backUrl,
          selfie_url: selfieUrl,
          proof_of_address_url: proofOfAddressUrl,
          submitted_at: new Date().toISOString(),
          verification_result: verificationResult,
          flagged: flagged
        }
      });

      // Notify user
      await createNotification({
        userAddress: user.email,
        type: 'system',
        title: newStatus === 'verified' ? 'KYC Verified ✓' : 'KYC Submitted',
        message: newStatus === 'verified' 
          ? 'Your KYC verification has been approved! You can now trade up to higher limits.'
          : 'Your KYC documents have been submitted and are under review. We\'ll notify you once the review is complete.',
        link: createPageUrl('Profile'),
        priority: 'medium',
        metadata: { kyc_status: newStatus }
      });

      // If flagged or rejected, notify admins
      if (flagged || newStatus === 'rejected') {
        const admins = await base44.entities.UserProfile.filter({
          platform_role: { $in: ['admin', 'super_admin'] }
        });

        await Promise.all(admins.map(admin =>
          createNotification({
            userAddress: admin.wallet_address,
            type: 'system',
            title: '🚨 KYC Review Required',
            message: `KYC application from ${data.fullName} (${user.email}) requires manual review. Risk level: ${verificationResult.risk_level}`,
            link: createPageUrl('Admin'),
            priority: 'high',
            metadata: {
              user_address: user.email,
              kyc_status: newStatus,
              risk_level: verificationResult.risk_level,
              flagged: flagged
            }
          })
        ));
      }

      return { status: newStatus, verification: verificationResult };
    },
    onSuccess: (result) => {
      setUploading(false);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      if (result.status === 'verified') {
        toast.success(t('kyc.toast.verifiedAuto'));
      } else if (result.status === 'rejected') {
        toast.error(t('kyc.toast.rejected'));
      } else {
        toast.success(t('kyc.toast.submitted'));
      }
      
      onOpenChange(false);
    },
    onError: (error) => {
      setUploading(false);
      toast.error(t('kyc.toast.submitFailed'));
      console.error(error);
    }
  });

  const handleFileSelect = (file, setter, type) => {
    // Validate file size
    const sizeValidation = validateFileSize(file, 10);
    if (!sizeValidation.valid) {
      toast.error(t('kyc.toast.fileTooLarge', { maxSize: 10 }));
      return;
    }
    
    // Validate file type
    const typeValidation = validateFileType(file, ['image/jpeg', 'image/png', 'image/jpg']);
    if (!typeValidation.valid) {
      toast.error(t('kyc.toast.fileType', { types: 'jpg, jpeg, png' }));
      return;
    }
    
    setter(file);
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1) {
      if (!fullName || fullName.trim().length < 2) {
        toast.error(t('kyc.toast.fullNameRequired'));
        return;
      }
      if (!documentNumber || documentNumber.trim().length < 5) {
        toast.error(t('kyc.toast.documentNumberRequired'));
        return;
      }
      if (!dateOfBirth) {
        toast.error(t('kyc.toast.dobRequired'));
        return;
      }
      const age = Math.floor((new Date() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) {
        toast.error(t('kyc.toast.ageRequirement'));
        return;
      }
      if (!nationality) {
        toast.error(t('kyc.toast.nationalityRequired'));
        return;
      }
    }
    if (step === 2) {
      if (!address || !city || !country || !phoneNumber) {
        toast.error(t('kyc.toast.addressRequired'));
        return;
      }
    }
    setValidationErrors({});
    setStep(step + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!frontFile || !selfieFile || !proofOfAddressFile) {
      toast.error(t('kyc.toast.documentsRequired'));
      return;
    }

    if (documentType !== 'passport' && !backFile) {
      toast.error(t('kyc.toast.documentBackRequired'));
      return;
    }

    setValidationErrors({});
    submitKYC.mutate({
      documentType,
      documentNumber: sanitizeInput(documentNumber),
      fullName: sanitizeInput(fullName),
      dateOfBirth,
      nationality: sanitizeInput(nationality),
      address: sanitizeInput(address),
      city: sanitizeInput(city),
      postalCode: sanitizeInput(postalCode),
      country,
      phoneNumber: sanitizeInput(phoneNumber),
      frontFile,
      backFile,
      selfieFile,
      proofOfAddressFile
    });
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) setStep(1);
      onOpenChange(newOpen);
    }}>
      <DialogContent className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-700/50 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <div>KYC Verification</div>
              <p className="text-sm text-slate-400 font-normal">Step {step} of 3 - {['Personal Info', 'Address', 'Documents'][step - 1]}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                s <= step ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Personal Information & Document Type */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 mb-4">
                <h3 className="text-sm font-semibold text-blue-400 mb-1">Personal Information</h3>
                <p className="text-xs text-slate-400">Enter your personal details exactly as they appear on your ID</p>
              </div>

              <div>
                <Label>Document Type *</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {DOCUMENT_TYPES.map(doc => (
                      <SelectItem key={doc.value} value={doc.value}>{doc.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Full Legal Name *</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`bg-slate-800 ${validationErrors.fullName ? 'border-red-500' : 'border-slate-700'}`}
                  placeholder="As shown on your ID document"
                />
                {validationErrors.fullName && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date of Birth *</Label>
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="bg-slate-800 border-slate-700"
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-slate-500 mt-1">Must be 18 or older</p>
                </div>

                <div>
                  <Label>Nationality *</Label>
                  <Select value={nationality} onValueChange={setNationality}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {COUNTRIES.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Document Number *</Label>
                <Input
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                  placeholder="e.g., AB1234567"
                />
              </div>
            </div>
          )}

          {/* Step 2: Address Information */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 mb-4">
                <h3 className="text-sm font-semibold text-purple-400 mb-1">Residential Address</h3>
                <p className="text-xs text-slate-400">Provide your current residential address (proof required later)</p>
              </div>

              <div>
                <Label>Street Address *</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                  placeholder="123 Main Street, Apt 4B"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City *</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-slate-800 border-slate-700"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <Label>Postal/Zip Code *</Label>
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="bg-slate-800 border-slate-700"
                    placeholder="10001"
                  />
                </div>
              </div>

              <div>
                <Label>Country *</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {COUNTRIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Phone Number *</Label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                  placeholder="+1 234 567 8900"
                />
                <p className="text-xs text-slate-500 mt-1">Include country code</p>
              </div>
            </div>
          )}

          {/* Step 3: Document Uploads */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 mb-4">
                <h3 className="text-sm font-semibold text-emerald-400 mb-1">Document Upload</h3>
                <p className="text-xs text-slate-400">Upload clear, high-quality photos of your documents</p>
              </div>

            {/* Front */}
            <div>
              <Label>Document Front Side *</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleFileSelect(e.target.files[0], setFrontFile, 'front')}
                  className="hidden"
                  id="front-upload"
                />
                <label
                  htmlFor="front-upload"
                  className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-slate-700 hover:border-blue-500 cursor-pointer transition-colors bg-slate-800/50"
                >
                  {frontFile ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-400">{frontFile.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-slate-500" />
                      <span className="text-slate-400">Click to upload front side</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Back (conditional) */}
            {documentType !== 'passport' && (
              <div>
                <Label>Document Back Side *</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={(e) => handleFileSelect(e.target.files[0], setBackFile, 'back')}
                    className="hidden"
                    id="back-upload"
                  />
                  <label
                    htmlFor="back-upload"
                    className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-slate-700 hover:border-blue-500 cursor-pointer transition-colors bg-slate-800/50"
                  >
                    {backFile ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-400">{backFile.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-slate-500" />
                        <span className="text-slate-400">Click to upload back side</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            )}

            {/* Live Face Capture */}
            <div>
              <Label>Live Face Verification *</Label>
              <div className="mt-2">
                <LiveFaceCapture
                  onCapture={setSelfieFile}
                  capturedImage={selfieFile}
                />
              </div>
            </div>

            {/* Proof of Address */}
            <div>
              <Label>Proof of Address *</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={(e) => handleFileSelect(e.target.files[0], setProofOfAddressFile, 'address')}
                  className="hidden"
                  id="address-upload"
                />
                <label
                  htmlFor="address-upload"
                  className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-slate-700 hover:border-emerald-500 cursor-pointer transition-colors bg-slate-800/50"
                >
                  {proofOfAddressFile ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-400">{proofOfAddressFile.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-slate-500" />
                      <span className="text-slate-400">Click to upload proof of address</span>
                    </>
                  )}
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Utility bill, bank statement, or government letter (within 3 months)
              </p>
            </div>
              {/* Summary */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mt-6">
                <h4 className="text-sm font-semibold text-white mb-3">Verification Summary</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Full Name:</span>
                    <span className="text-white">{fullName || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date of Birth:</span>
                    <span className="text-white">{dateOfBirth || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nationality:</span>
                    <span className="text-white">{nationality || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Address:</span>
                    <span className="text-white text-right">{address && city ? `${city}, ${country}` : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Documents:</span>
                    <span className="text-emerald-400">
                      {[frontFile, selfieFile, proofOfAddressFile].filter(Boolean).length} / 3+ uploaded
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Banner */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 mt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-300">
                <p className="font-semibold text-white mb-1">🤖 AI-Powered Verification</p>
                <p>Your documents are analyzed using advanced AI for instant verification. Most applications are approved immediately. Manual review occurs within 24 hours if needed.</p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1 border-slate-600"
                disabled={uploading}
              >
                Previous
              </Button>
            )}
            
            {step < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={uploading}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 shadow-lg shadow-emerald-500/20"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit for Verification
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
