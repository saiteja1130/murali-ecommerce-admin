import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Star, CheckCircle, XCircle, MessageSquare, Sparkles, ShieldCheck, Search } from 'lucide-react';
export const ReviewModeration = () => {
    const { reviews, approveReview, rejectReview, featureReview, replyToReview, showToast } = useAdmin();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [replyingReviewId, setReplyingReviewId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const filteredReviews = reviews.filter((r) => {
        const matchesSearch = r.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.comment.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchesRating = ratingFilter === 'all' || r.rating === Number(ratingFilter);
        return matchesSearch && matchesStatus && matchesRating;
    });
    const handleSendReply = (reviewId) => {
        if (!replyText.trim())
            return;
        replyToReview(reviewId, replyText.trim());
        setReplyingReviewId(null);
        setReplyText('');
    };
    return (<div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
              Client Testimonials & Review Moderation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#C8A87C]/15 text-[#A68758] font-bold">
              {reviews.filter((r) => r.status === 'pending').length} Pending Approval
            </span>
          </div>
          <p className="text-xs text-[#6B6864] mt-1">
            Moderate verified customer feedback, feature testimonials on homepage, and post bespoke concierge replies.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#A68758] absolute left-3 top-2.5"/>
            <input type="text" placeholder="Search by patron, garment, keywords..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]"/>
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]">
            <option value="all">All Moderation Statuses</option>
            <option value="pending">Pending Moderation</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]">
            <option value="all">All Star Ratings</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars & Below</option>
          </select>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (<div className="bg-white rounded-2xl border border-[#E8E4DC] p-12 text-center text-[#6B6864] text-xs">
            No testimonials match your filter criteria.
          </div>) : (filteredReviews.map((rev) => (<div key={rev.id} className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#1A1A1A]">{rev.author}</span>
                    {rev.vipTier && (<span className="px-2 py-0.2 rounded font-mono text-[9px] uppercase bg-[#C8A87C]/20 text-[#A68758] font-bold">
                        {rev.vipTier}
                      </span>)}
                    {rev.isVerifiedPurchase && (<span className="flex items-center gap-1 text-[10px] text-[#4A7A5E] font-medium">
                        <ShieldCheck className="w-3.5 h-3.5"/>
                        <span>Verified Haute Purchase</span>
                      </span>)}
                  </div>
                  <div className="text-xs text-[#6B6864] mt-0.5">
                    Reviewed on piece: <strong className="text-[#1A1A1A]">{rev.productName}</strong> •{' '}
                    <span className="font-mono">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Rating Stars & Status Badge */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`w-4 h-4 ${i < rev.rating
                    ? 'text-[#C8A87C] fill-[#C8A87C]'
                    : 'text-[#E8E4DC]'}`}/>))}
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono font-semibold ${rev.status === 'approved'
                ? 'bg-[#4A7A5E]/15 text-[#4A7A5E]'
                : rev.status === 'pending'
                    ? 'bg-[#B8863F]/15 text-[#B8863F]'
                    : 'bg-[#A5432F]/15 text-[#A5432F]'}`}>
                    {rev.status}
                  </span>
                </div>
              </div>

              {/* Review Commentary */}
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] text-xs text-[#1A1A1A] leading-relaxed font-sans">
                "{rev.comment}"
              </div>

              {/* Official Concierge Reply if exists */}
              {rev.officialReply && (<div className="p-3.5 ml-4 bg-[#1A1A1A] text-white rounded-xl text-xs space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#C8A87C] font-bold">
                    Official SUMILUX Concierge Response:
                  </div>
                  <p className="text-[#E8E4DC] italic font-serif leading-relaxed">
                    "{rev.officialReply}"
                  </p>
                </div>)}

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F2EFE9] text-xs">
                <div className="flex items-center gap-2">
                  <button onClick={() => featureReview(rev.id)} className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition-colors ${rev.isFeatured
                ? 'bg-[#1A1A1A] text-[#C8A87C] border-[#1A1A1A]'
                : 'bg-white text-[#6B6864] border-[#E8E4DC] hover:text-[#1A1A1A]'}`}>
                    <Sparkles className="w-3.5 h-3.5"/>
                    <span>{rev.isFeatured ? 'Featured on Storefront' : 'Feature on Homepage'}</span>
                  </button>
                  <button onClick={() => setReplyingReviewId(replyingReviewId === rev.id ? null : rev.id)} className="px-3 py-1.5 rounded-xl border border-[#E8E4DC] bg-white text-[#1A1A1A] font-semibold hover:bg-[#FAF8F5] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#C8A87C]"/>
                    <span>Official Reply</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {rev.status !== 'approved' && (<button onClick={() => approveReview(rev.id)} className="px-3 py-1.5 bg-[#4A7A5E] hover:bg-emerald-800 text-white rounded-xl font-semibold transition-colors flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5"/>
                      <span>Approve</span>
                    </button>)}
                  {rev.status !== 'rejected' && (<button onClick={() => rejectReview(rev.id)} className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E8E4DC] hover:bg-[#A5432F]/10 text-[#A5432F] rounded-xl font-semibold transition-colors flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5"/>
                      <span>Reject</span>
                    </button>)}
                </div>
              </div>

              {/* Reply Form if open */}
              {replyingReviewId === rev.id && (<div className="pt-3 border-t border-[#E8E4DC] space-y-2 animate-in fade-in duration-150">
                  <label className="block text-[11px] font-semibold text-[#1A1A1A] uppercase tracking-wider">
                    Author Official Concierge Response:
                  </label>
                  <textarea rows={2} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Express gratitude to the client and reaffirm SUMILUX atelier quality commitments..." className="w-full px-3.5 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]"/>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setReplyingReviewId(null)} className="px-3 py-1.5 rounded-lg text-xs text-[#6B6864]">
                      Cancel
                    </button>
                    <button onClick={() => handleSendReply(rev.id)} className="px-4 py-1.5 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#333333]">
                      Post Response
                    </button>
                  </div>
                </div>)}
            </div>)))}
      </div>
    </div>);
};
export default ReviewModeration;
