/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  source: 'المركز' | 'وزارة العدل';
  category: 'أخبار' | 'إعلانات' | 'تعاميم' | 'دراسات';
  image?: string;
  views?: number;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  audience: 'مواطن' | 'باحث' | 'قضاء';
  requirements: string[];
  processingTime: string;
  fees: string;
  iconName: string;
}

export interface RequestUpdate {
  date: string;
  status: string;
  notes: string;
}

export interface ServiceRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  applicantIdNumber: string;
  details: string;
  attachmentName?: string;
  trackingCode: string;
  status: 'قيد المراجعة' | 'تحت التدقيق' | 'مقبول' | 'مرفوض' | 'مكتمل';
  submissionDate: string;
  updates: RequestUpdate[];
}

