var nt=Object.defineProperty;var at=(c,u,p)=>u in c?nt(c,u,{enumerable:!0,configurable:!0,writable:!0,value:p}):c[u]=p;var i=(c,u,p)=>(at(c,typeof u!="symbol"?u+"":u,p),p),j=(c,u,p)=>{if(!u.has(c))throw TypeError("Cannot "+p)};var o=(c,u,p)=>(j(c,u,"read from private field"),p?p.call(c):u.get(c)),y=(c,u,p)=>{if(u.has(c))throw TypeError("Cannot add the same private member more than once");u instanceof WeakSet?u.add(c):u.set(c,p)},S=(c,u,p,X)=>(j(c,u,"write to private field"),X?X.call(c,p):u.set(c,p),p);var J=(c,u,p)=>(j(c,u,"access private method"),p);(function(){var k,N,R,I,A,L,M,D,x,U,O,V,Q;"use strict";function c(b){return("00"+b.toString(16)).slice(-2)}const u=new Set(["packet","annexB","unknown"]),p=new Map([[66,"BASELINE"],[77,"MAIN"],[88,"EXTENDED"],[100,"FREXT_HP"],[110,"FREXT_Hi10P"],[122,"FREXT_Hi422"],[244,"FREXT_Hi444"],[44,"FREXT_CAVLC444"]]);class X{constructor(e){i(this,"ptr");i(this,"buffer");i(this,"originalByteLength");i(this,"max");this.ptr=0,typeof e=="number"?(this.buffer=new Uint8Array(e+7>>3),this.originalByteLength=this.buffer.byteLength,this.max=e):typeof e>"u"?(this.buffer=new Uint8Array(8192),this.originalByteLength=this.buffer.byteLength,this.max=65536):(this.buffer=new Uint8Array(e,0,e.byteLength),this.max=this.buffer.byteLength<<3,this.originalByteLength=e.byteLength)}get peek16(){let e=16,t=this.ptr;e+t>this.remaining&&(e=this.remaining);const r=[],s=[],n=[];let a=0;for(let _=0;_<e;_++){const T=t>>3,P=7-(t&7),d=this.buffer[T]>>P&1;if(a=a<<1|d,n.push(d),t++,_===e-1||_%4===3){s.push(a.toString(16));let l="";n.forEach(m=>{l+=m===0?"0":"1"}),r.push(l),n.length=0,a=0}}return r.join(" ")+" "+s.join("")}get remaining(){return this.max-this.ptr}get consumed(){return this.ptr}seek(e=0){if(e>this.max)throw new Error("cannot seek beyond end");this.ptr=e}reallocate(e){if(this.ptr+e<=this.max)return;const t=255+Math.floor((this.max+e)*1.25)&-256,r=new Uint8Array(t+7>>>3);this.max=t,r.set(this.buffer),this.buffer=r}copyBits(e,t,r,s){this.reallocate(r);const n=e.ptr,a=this.ptr;e.ptr=t,typeof s=="number"&&(this.ptr=s);const _=8-this.ptr&7,T=r-_&7,P=r-(_+T);for(let f=0;f<_;f++){const h=e.u_1();this.put_u_1(h)}const d=this.buffer,l=e.buffer;let m=this.ptr>>3;const B=P>>3,w=e.ptr&7;if(w===0){let f=e.ptr>>3,h=B&3;for(;h-- >0;)d[m++]=l[f++];for(h=B>>2;h-- >0;)d[m++]=l[f++],d[m++]=l[f++],d[m++]=l[f++],d[m++]=l[f++]}else{const f=8-w,h=255<<f&255;let E=(e.ptr>>3)+1,v=l[E-1],g=l[E],Y=B&7;for(;Y-- >0;)d[m++]=(v&~h)<<w|(g&h)>>f,v=g,g=l[++E];for(Y=B>>3;Y-- >0;)d[m++]=(v&~h)<<w|(g&h)>>f,v=l[++E],d[m++]=(g&~h)<<w|(v&h)>>f,g=l[++E],d[m++]=(v&~h)<<w|(g&h)>>f,v=l[++E],d[m++]=(g&~h)<<w|(v&h)>>f,g=l[++E],d[m++]=(v&~h)<<w|(g&h)>>f,v=l[++E],d[m++]=(g&~h)<<w|(v&h)>>f,g=l[++E],d[m++]=(v&~h)<<w|(g&h)>>f,v=l[++E],d[m++]=(g&~h)<<w|(v&h)>>f,g=l[++E]}e.ptr+=P,this.ptr+=P;for(let f=0;f<T;f++){const h=e.u_1();this.put_u_1(h)}e.ptr=n,typeof s=="number"&&(this.ptr=a)}put_u_1(e){if(this.ptr+1>this.max)throw new Error("NALUStream error: bitstream exhausted");const t=this.ptr>>3,r=7-(this.ptr&7),s=e<<r,n=~(1<<r);return this.buffer[t]=this.buffer[t]&n|s,this.ptr++,s}u_1(){if(this.ptr+1>this.max)throw new Error("NALUStream error: bitstream exhausted");const e=this.ptr>>3,t=7-(this.ptr&7),r=this.buffer[e]>>t&1;return this.ptr++,r}u_2(){return this.u_1()<<1|this.u_1()}u_3(){return this.u_1()<<2|this.u_1()<<1|this.u_1()}u(e){if(e===8)return this.u_8();if(this.ptr+e>=this.max)throw new Error("NALUStream error: bitstream exhausted");let t=0;for(let r=0;r<e;r++)t=t<<1|this.u_1();return t}u_8(){if(this.ptr+8>this.max)throw new Error("NALUStream error: bitstream exhausted");const e=this.ptr&7;if(e===0){const t=this.buffer[this.ptr>>3];return this.ptr+=8,t}else{const t=8-e,r=255<<t&255,s=~r&255,n=this.ptr>>3;return this.ptr+=8,(this.buffer[n]&s)<<e|(this.buffer[n+1]&r)>>t}}ue_v(){let e=0;for(;!this.u_1();)e++;let t=1<<e;for(let r=e-1;r>=0;r--)t|=this.u_1()<<r;return t-1}put_u8(e){if(this.reallocate(8),!(this.ptr&7)){this.buffer[this.ptr>>3]=e,this.ptr+=8;return}this.put_u(e,8)}put_u(e,t){if(this.reallocate(t),t!==0)for(;t>0;)t--,this.put_u_1(e>>t&1)}put_ue_v(e){const t=e+1;let r=t,s=-1;do s++,r=r>>1;while(r!==0);return this.put_u(0,s),this.put_u(t,s+1),s+s+1}put_complete(){const e=this.ptr,t=e+7>>3;return this.buffer=this.buffer.subarray(0,t),this.originalByteLength=t,this.max=e,this.ptr=0,e}se_v(){const e=this.ue_v(),t=e&1?1+(e>>1):-(e>>1);return t===0?0:t}put_se_v(e){const t=e<=0?-e<<1:(e<<1)-1;return this.put_ue_v(t)}}class K extends X{constructor(t){super(t);i(this,"deemulated",!1);typeof t!="number"&&typeof t<"u"&&(this.deemulated=this.hasEmulationPrevention(this.buffer),this.buffer=this.deemulated?this.deemulate(this.buffer):this.buffer,this.max=this.buffer.byteLength<<3)}get stream(){return this.deemulated?this.reemulate(this.buffer):this.buffer}copyBits(t,r,s,n){this.deemulated=t.deemulated,super.copyBits(t,r,s,n)}reemulate(t){const r=Math.floor(this.originalByteLength*1.2),s=new Uint8Array(r),n=t.byteLength-1;let a=0,_=0;for(s[_++]=t[a++],s[_++]=t[a++];a<n;)t[a-2]===0&&t[a-1]===0&&t[a]<=3&&(s[_++]=3,s[_++]=t[a++]),s[_++]=t[a++];return s[_++]=t[a++],s.subarray(0,_)}hasEmulationPrevention(t){for(let r=1;r<t.byteLength;r++)if(t[r-1]===0&&t[r]===0)return!0;return!1}deemulate(t){const r=new Uint8Array(t.byteLength);let s=0,n=0;const a=t.byteLength-1;for(r[n++]=t[s++],r[n++]=t[s++];s<a;)t[s-2]===0&&t[s-1]===0&&t[s]===3&&t[s]<=3?s++:r[n++]=t[s++];return r[n++]=t[s++],r.subarray(0,n)}}class q{constructor(e,t){i(this,"strict");i(this,"type");i(this,"buf");i(this,"boxSize");i(this,"cursor");i(this,"nextPacket");i(this,"getType",e=>{if(this.type&&this.boxSize)return{type:this.type,boxSize:this.boxSize};if(!this.type||this.type==="annexB"){if(this.buf[0]===0&&this.buf[1]===0&&this.buf[2]===1)return{type:"annexB",boxSize:3};if(this.buf[0]===0&&this.buf[1]===0&&this.buf[2]===0&&this.buf[3]===1)return{type:"annexB",boxSize:4}}for(let t=4;t>=1;t--){let r=0;if(this.buf.length<=t){r=-1;break}let s=this.nextLengthCountedPacket(this.buf,0,t);for(;;){if(s.n<-1){r=-1;break}if(s.e-s.s&&(r++,e&&r>=e)||s.n<0)break;s=this.nextLengthCountedPacket(this.buf,s.n,t)}if(r>0)return{type:"packet",boxSize:t}}if(this.strict)throw new Error("NALUStream error: cannot determine stream type or box size");return{type:"unknown",boxSize:-1}});if(this.strict=!1,this.type=null,this.boxSize=null,this.cursor=0,this.nextPacket=void 0,t&&(typeof t.strict=="boolean"&&(this.strict=!!t.strict),t.boxSizeMinusOne&&(this.boxSize=t.boxSizeMinusOne+1),t.boxSize&&(this.boxSize=t.boxSize),t.type&&(this.type=t.type),this.type&&!u.has(this.type)))throw new Error("NALUStream error: type must be packet or annexB");if(this.strict&&this.boxSize&&(this.boxSize<2||this.boxSize>6))throw new Error("NALUStream error: invalid boxSize");if(this.buf=new Uint8Array(e,0,e.length),!this.type||!this.boxSize){const{type:r,boxSize:s}=this.getType(4);this.type=r,this.boxSize=s}this.nextPacket=this.type==="packet"?this.nextLengthCountedPacket:this.nextAnnexBPacket}get boxSizeMinusOne(){return this.boxSize-1}get packetCount(){return this.iterate()}get packets(){const e=[];return this.iterate((t,r,s)=>{const n=t.subarray(r,s);e.push(n)}),e}static readUIntNBE(e,t,r){if(!r)throw new Error("readUIntNBE error: need a boxsize");let s=0;for(let n=t;n<t+r;n++)s=s<<8|e[n];return s}static array2hex(e){return Array.prototype.map.call(new Uint8Array(e,0,e.byteLength),t=>("00"+t.toString(16)).slice(-2)).join(" ")}[Symbol.iterator](){let e={n:0,s:0,e:0};return{next:()=>{var t,r;if(this.type==="unknown"||this.boxSize<1||e.n<0)return{value:void 0,done:!0};for(e=((t=this.nextPacket)==null?void 0:t.call(this,this.buf,e.n,this.boxSize))??{n:0,s:0,e:0};;){if(e.e>e.s)return{value:this.buf.subarray(e.s,e.e),done:!1};if(e.n<0)break;e=((r=this.nextPacket)==null?void 0:r.call(this,this.buf,e.n,this.boxSize))??{n:0,s:0,e:0}}return{value:void 0,done:!0}}}}nalus(){return{[Symbol.iterator]:()=>{let e={n:0,s:0,e:0};return{next:()=>{var t,r;if(this.type==="unknown"||this.boxSize<1||e.n<0)return{value:void 0,done:!0};for(e=((t=this.nextPacket)==null?void 0:t.call(this,this.buf,e.n,this.boxSize))??{n:0,s:0,e:0};;){if(e.e>e.s){const s=this.buf.subarray(e.s,e.e),n=this.buf.subarray(e.s-this.boxSize,e.e);return{value:{nalu:s,rawNalu:n},done:!1}}if(e.n<0)break;e=((r=this.nextPacket)==null?void 0:r.call(this,this.buf,e.n,this.boxSize))??{n:0,s:0,e:0}}return{value:void 0,done:!0}}}}}}convertToPacket(){return this.type==="packet"?this:(this.type==="annexB"&&this.boxSize===4?this.iterate((e,t,r)=>{let s=t-4;if(s<0)throw new Error("NALUStream error: Unexpected packet format");const n=r-t;e[s++]=255&n>>24,e[s++]=255&n>>16,e[s++]=255&n>>8,e[s++]=255&n}):this.type==="annexB"&&this.boxSize===3&&this.iterate((e,t,r)=>{let s=t-3;if(s<0)throw new Error("Unexpected packet format");const n=r-t;if(this.strict&&n>>24)throw new Error("NALUStream error: Packet too long to store length when boxLenMinusOne is 2");e[s++]=255&n>>16,e[s++]=255&n>>8,e[s++]=255&n}),this.type="packet",this.nextPacket=this.nextLengthCountedPacket,this)}convertToAnnexB(){return this.type==="annexB"?this:(this.type==="packet"&&this.boxSize===4?this.iterate((e,t)=>{let r=t-4;if(r<0)throw new Error("NALUStream error: Unexpected packet format");e[r++]=0,e[r++]=0,e[r++]=0,e[r++]=1}):this.type==="packet"&&this.boxSize===3&&this.iterate((e,t)=>{let r=t-3;if(r<0)throw new Error("Unexpected packet format");e[r++]=0,e[r++]=0,e[r++]=1}),this.type="annexB",this.nextPacket=this.nextAnnexBPacket,this)}iterate(e=void 0){var s,n;if(this.type==="unknown"||this.boxSize<1)return 0;let t=0,r=((s=this.nextPacket)==null?void 0:s.call(this,this.buf,0,this.boxSize))??{n:0,s:0,e:0};for(;r.e>r.s&&(t++,typeof e=="function"&&e(this.buf,r.s,r.e)),!(r.n<0);)r=((n=this.nextPacket)==null?void 0:n.call(this,this.buf,r.n,this.boxSize))??{n:0,s:0,e:0};return t}nextAnnexBPacket(e,t,r){const s=e.byteLength,n=t;if(t===s)return{n:-1,s:n,e:t};for(;t<s;){if(t+2>s)return{n:-1,s:n,e:s};if(e[t]===0&&e[t+1]===0){const a=e[t+2];if(a===1)return{n:t+3,s:n,e:t};if(a===0){if(t+3>s)return{n:-1,s:n,e:s};if(e[t+3]===1)return{n:t+4,s:n,e:t}}}t++}return{n:-1,s:n,e:t}}nextLengthCountedPacket(e,t,r){const s=e.byteLength;if(t<s){const n=q.readUIntNBE(e,t,r);return n<2||n>s+r?{n:-2,s:0,e:0,message:"bad length"}:{n:t+r+n,s:t+r,e:t+r+n}}return{n:-1,s:0,e:0,message:"end of buffer"}}}class Z{constructor(e){i(this,"bitstream");i(this,"nal_ref_id");i(this,"nal_unit_type");i(this,"profile_idc");i(this,"profileName");i(this,"constraint_set0_flag");i(this,"constraint_set1_flag");i(this,"constraint_set2_flag");i(this,"constraint_set3_flag");i(this,"constraint_set4_flag");i(this,"constraint_set5_flag");i(this,"level_idc");i(this,"seq_parameter_set_id");i(this,"has_no_chroma_format_idc");i(this,"chroma_format_idc");i(this,"bit_depth_luma_minus8");i(this,"separate_colour_plane_flag");i(this,"chromaArrayType");i(this,"bitDepthLuma");i(this,"bit_depth_chroma_minus8");i(this,"lossless_qpprime_flag");i(this,"bitDepthChroma");i(this,"seq_scaling_matrix_present_flag");i(this,"seq_scaling_list_present_flag");i(this,"seq_scaling_list");i(this,"log2_max_frame_num_minus4");i(this,"maxFrameNum");i(this,"pic_order_cnt_type");i(this,"log2_max_pic_order_cnt_lsb_minus4");i(this,"maxPicOrderCntLsb");i(this,"delta_pic_order_always_zero_flag");i(this,"offset_for_non_ref_pic");i(this,"offset_for_top_to_bottom_field");i(this,"num_ref_frames_in_pic_order_cnt_cycle");i(this,"offset_for_ref_frame");i(this,"max_num_ref_frames");i(this,"gaps_in_frame_num_value_allowed_flag");i(this,"pic_width_in_mbs_minus_1");i(this,"picWidth");i(this,"pic_height_in_map_units_minus_1");i(this,"frame_mbs_only_flag");i(this,"interlaced");i(this,"mb_adaptive_frame_field_flag");i(this,"picHeight");i(this,"direct_8x8_inference_flag");i(this,"frame_cropping_flag");i(this,"frame_cropping_rect_left_offset");i(this,"frame_cropping_rect_right_offset");i(this,"frame_cropping_rect_top_offset");i(this,"frame_cropping_rect_bottom_offset");i(this,"cropRect");i(this,"vui_parameters_present_flag");i(this,"aspect_ratio_info_present_flag");i(this,"aspect_ratio_idc");i(this,"sar_width");i(this,"sar_height");i(this,"overscan_info_present_flag");i(this,"overscan_appropriate_flag");i(this,"video_signal_type_present_flag");i(this,"video_format");i(this,"video_full_range_flag");i(this,"color_description_present_flag");i(this,"color_primaries");i(this,"transfer_characteristics");i(this,"matrix_coefficients");i(this,"chroma_loc_info_present_flag");i(this,"chroma_sample_loc_type_top_field");i(this,"chroma_sample_loc_type_bottom_field");i(this,"timing_info_present_flag");i(this,"num_units_in_tick");i(this,"time_scale");i(this,"fixed_frame_rate_flag");i(this,"framesPerSecond");i(this,"nal_hrd_parameters_present_flag");i(this,"success");const t=new K(e);if(this.bitstream=t,t.u_1())throw new Error("NALU error: invalid NALU header");if(this.nal_ref_id=t.u_2(),this.nal_unit_type=t.u(5),this.nal_unit_type!==7)throw new Error("SPS error: not SPS");if(this.profile_idc=t.u_8(),p.has(this.profile_idc))this.profileName=p.get(this.profile_idc);else throw new Error("SPS error: invalid profile_idc");if(this.constraint_set0_flag=t.u_1(),this.constraint_set1_flag=t.u_1(),this.constraint_set2_flag=t.u_1(),this.constraint_set3_flag=t.u_1(),this.constraint_set4_flag=t.u_1(),this.constraint_set5_flag=t.u_1(),t.u_2()!==0)throw new Error("SPS error: reserved_zero_2bits must be zero");if(this.level_idc=t.u_8(),this.seq_parameter_set_id=t.ue_v(),this.seq_parameter_set_id>31)throw new Error("SPS error: seq_parameter_set_id must be 31 or less");if(this.has_no_chroma_format_idc=this.profile_idc===66||this.profile_idc===77||this.profile_idc===88,!this.has_no_chroma_format_idc){if(this.chroma_format_idc=t.ue_v(),this.bit_depth_luma_minus8&&this.bit_depth_luma_minus8>3)throw new Error("SPS error: chroma_format_idc must be 3 or less");if(this.chroma_format_idc===3&&(this.separate_colour_plane_flag=t.u_1(),this.chromaArrayType=this.separate_colour_plane_flag?0:this.chroma_format_idc),this.bit_depth_luma_minus8=t.ue_v(),this.bit_depth_luma_minus8>6)throw new Error("SPS error: bit_depth_luma_minus8 must be 6 or less");if(this.bitDepthLuma=this.bit_depth_luma_minus8+8,this.bit_depth_chroma_minus8=t.ue_v(),this.bit_depth_chroma_minus8>6)throw new Error("SPS error: bit_depth_chroma_minus8 must be 6 or less");if(this.lossless_qpprime_flag=t.u_1(),this.bitDepthChroma=this.bit_depth_chroma_minus8+8,this.seq_scaling_matrix_present_flag=t.u_1(),this.seq_scaling_matrix_present_flag){const n=this.chroma_format_idc!==3?8:12;this.seq_scaling_list_present_flag=[],this.seq_scaling_list=[];for(let a=0;a<n;a++){const _=t.u_1();if(this.seq_scaling_list_present_flag.push(_),_){const T=a<6?16:64;let P=8,d=8;const l=[];for(let m=0;m<T;m++){if(P!==0){const B=t.se_v();l.push(B),P=(d+B+256)%256}d=P===0?d:P,this.seq_scaling_list.push(l)}}}}}if(this.log2_max_frame_num_minus4=t.ue_v(),this.log2_max_frame_num_minus4>12)throw new Error("SPS error: log2_max_frame_num_minus4 must be 12 or less");if(this.maxFrameNum=1<<this.log2_max_frame_num_minus4+4,this.pic_order_cnt_type=t.ue_v(),this.pic_order_cnt_type>2)throw new Error("SPS error: pic_order_cnt_type must be 2 or less");switch(this.pic_order_cnt_type){case 0:if(this.log2_max_pic_order_cnt_lsb_minus4=t.ue_v(),this.log2_max_pic_order_cnt_lsb_minus4>12)throw new Error("SPS error: log2_max_pic_order_cnt_lsb_minus4 must be 12 or less");this.maxPicOrderCntLsb=1<<this.log2_max_pic_order_cnt_lsb_minus4+4;break;case 1:this.delta_pic_order_always_zero_flag=t.u_1(),this.offset_for_non_ref_pic=t.se_v(),this.offset_for_top_to_bottom_field=t.se_v(),this.num_ref_frames_in_pic_order_cnt_cycle=t.ue_v(),this.offset_for_ref_frame=[];for(let n=0;n<this.num_ref_frames_in_pic_order_cnt_cycle;n++){const a=t.se_v();this.offset_for_ref_frame.push(a)}break}this.max_num_ref_frames=t.ue_v(),this.gaps_in_frame_num_value_allowed_flag=t.u_1(),this.pic_width_in_mbs_minus_1=t.ue_v(),this.picWidth=this.pic_width_in_mbs_minus_1+1<<4,this.pic_height_in_map_units_minus_1=t.ue_v(),this.frame_mbs_only_flag=t.u_1(),this.interlaced=!this.frame_mbs_only_flag,this.frame_mbs_only_flag===0&&(this.mb_adaptive_frame_field_flag=t.u_1()),this.picHeight=(2-this.frame_mbs_only_flag)*(this.pic_height_in_map_units_minus_1+1)<<4,this.direct_8x8_inference_flag=t.u_1(),this.frame_cropping_flag=t.u_1(),this.frame_cropping_flag?(this.frame_cropping_rect_left_offset=t.ue_v(),this.frame_cropping_rect_right_offset=t.ue_v(),this.frame_cropping_rect_top_offset=t.ue_v(),this.frame_cropping_rect_bottom_offset=t.ue_v(),this.cropRect={x:this.frame_cropping_rect_left_offset,y:this.frame_cropping_rect_top_offset,width:this.picWidth-(this.frame_cropping_rect_left_offset+this.frame_cropping_rect_right_offset),height:this.picHeight-(this.frame_cropping_rect_top_offset+this.frame_cropping_rect_bottom_offset)}):this.cropRect={x:0,y:0,width:this.picWidth,height:this.picHeight},this.vui_parameters_present_flag=t.u_1(),this.vui_parameters_present_flag&&(this.aspect_ratio_info_present_flag=t.u_1(),this.aspect_ratio_info_present_flag&&(this.aspect_ratio_idc=t.u_8(),this.aspect_ratio_idc&&(this.sar_width=t.u(16),this.sar_height=t.u(16))),this.overscan_info_present_flag=t.u_1(),this.overscan_info_present_flag&&(this.overscan_appropriate_flag=t.u_1()),this.video_signal_type_present_flag=t.u_1(),this.video_signal_type_present_flag&&(this.video_format=t.u(3),this.video_full_range_flag=t.u_1(),this.color_description_present_flag=t.u_1(),this.color_description_present_flag&&(this.color_primaries=t.u_8(),this.transfer_characteristics=t.u_8(),this.matrix_coefficients=t.u_8())),this.chroma_loc_info_present_flag=t.u_1(),this.chroma_loc_info_present_flag&&(this.chroma_sample_loc_type_top_field=t.ue_v(),this.chroma_sample_loc_type_bottom_field=t.ue_v()),this.timing_info_present_flag=t.u_1(),this.timing_info_present_flag&&(this.num_units_in_tick=t.u(32),this.time_scale=t.u(32),this.fixed_frame_rate_flag=t.u_1(),this.num_units_in_tick&&this.time_scale&&this.num_units_in_tick>0&&(this.framesPerSecond=this.time_scale/(2*this.num_units_in_tick))),this.nal_hrd_parameters_present_flag=t.u_1()),this.success=!0}get stream(){return this.bitstream.stream}get profile_compatibility(){let e=this.constraint_set0_flag<<7;return e|=this.constraint_set1_flag<<6,e|=this.constraint_set2_flag<<5,e|=this.constraint_set3_flag<<4,e|=this.constraint_set4_flag<<3,e|=this.constraint_set5_flag<<1,e}get MIME(){const e=[];return e.push("avc1."),e.push(c(this.profile_idc).toUpperCase()),e.push(c(this.profile_compatibility).toUpperCase()),e.push(c(this.level_idc).toUpperCase()),e.join("")}}function $(b,e){const t=new q(b,{type:"annexB"});for(const r of t.nalus())if(r!=null&&r.nalu){const s=new K(r.nalu);s.seek(3);const n=s.u(5);if(n===e)return{type:n,...r}}return null}function tt(b){return!!$(b,5)}function et(b){const e=$(b,7);if(e){const t=new Z(e.nalu);return{codec:t.MIME,codedHeight:t.picHeight,codedWidth:t.picWidth,hardwareAcceleration:"prefer-hardware"}}return null}const F=class F{constructor(e){y(this,k,null);y(this,N,null);S(this,k,e);const t=S(this,N,e.getContext("webgl2"));if(!t)throw Error("WebGL context is null");const r=t.createShader(t.VERTEX_SHADER);if(!r)throw Error("VertexShader is null");if(t.shaderSource(r,F.vertexShaderSource),t.compileShader(r),t.getShaderParameter(r,t.COMPILE_STATUS)==null)throw t.getShaderInfoLog(r);const s=t.createShader(t.FRAGMENT_SHADER);if(!s)throw Error("FragmentShader is null");if(t.shaderSource(s,F.fragmentShaderSource),t.compileShader(s),t.getShaderParameter(s,t.COMPILE_STATUS)==null)throw t.getShaderInfoLog(s);const n=t.createProgram();if(!n)throw Error("ShaderProgram is null");if(t.attachShader(n,r),t.attachShader(n,s),t.linkProgram(n),t.getProgramParameter(n,t.LINK_STATUS)==null)throw t.getProgramInfoLog(n);t.useProgram(n);const a=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,a),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),t.STATIC_DRAW);const _=t.getAttribLocation(n,"xy");t.vertexAttribPointer(_,2,t.FLOAT,!1,0,0),t.enableVertexAttribArray(_);const T=t.createTexture();t.bindTexture(t.TEXTURE_2D,T),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE)}draw(e){o(this,k)&&(o(this,k).width=e.displayWidth,o(this,k).height=e.displayHeight);const t=o(this,N);t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,e),e.close(),t.viewport(0,0,t.drawingBufferWidth,t.drawingBufferHeight),t.clearColor(1,0,0,1),t.clear(t.COLOR_BUFFER_BIT),t.drawArrays(t.TRIANGLE_FAN,0,4)}};k=new WeakMap,N=new WeakMap,i(F,"vertexShaderSource",`
      attribute vec2 xy;

      varying highp vec2 uv;

      void main(void) {
        gl_Position = vec4(xy, 0.0, 1.0);
        // Map vertex coordinates (-1 to +1) to UV coordinates (0 to 1).
        // UV coordinates are Y-flipped relative to vertex coordinates.
        uv = vec2((1.0 + xy.x) / 2.0, (1.0 - xy.y) / 2.0);
      }
    `),i(F,"fragmentShaderSource",`
      varying highp vec2 uv;

      uniform sampler2D texture;

      void main(void) {
        gl_FragColor = texture2D(texture, uv);
      }
    `);let H=F;const C=class C{constructor(e){y(this,R,null);y(this,I,null);S(this,R,e);const t=S(this,I,e.getContext("webgl"));if(!t)throw Error("WebGL context is null");const r=t.createShader(t.VERTEX_SHADER);if(!r)throw Error("VertexShader is null");if(t.shaderSource(r,C.vertexShaderSource),t.compileShader(r),t.getShaderParameter(r,t.COMPILE_STATUS)==null)throw t.getShaderInfoLog(r);const s=t.createShader(t.FRAGMENT_SHADER);if(!s)throw Error("FragmentShader is null");if(t.shaderSource(s,C.fragmentShaderSource),t.compileShader(s),t.getShaderParameter(s,t.COMPILE_STATUS)==null)throw t.getShaderInfoLog(s);const n=t.createProgram();if(!n)throw Error("ShaderProgram is null");if(t.attachShader(n,r),t.attachShader(n,s),t.linkProgram(n),t.getProgramParameter(n,t.LINK_STATUS)==null)throw t.getProgramInfoLog(n);t.useProgram(n);const a=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,a),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),t.STATIC_DRAW);const _=t.getAttribLocation(n,"xy");t.vertexAttribPointer(_,2,t.FLOAT,!1,0,0),t.enableVertexAttribArray(_);const T=t.createTexture();t.bindTexture(t.TEXTURE_2D,T),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE)}draw(e){o(this,R)&&(o(this,R).width=e.displayWidth,o(this,R).height=e.displayHeight);const t=o(this,I);t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,e),e.close(),t.viewport(0,0,t.drawingBufferWidth,t.drawingBufferHeight),t.clearColor(1,0,0,1),t.clear(t.COLOR_BUFFER_BIT),t.drawArrays(t.TRIANGLE_FAN,0,4)}};R=new WeakMap,I=new WeakMap,i(C,"vertexShaderSource",`
      attribute vec2 xy;

      varying highp vec2 uv;

      void main(void) {
        gl_Position = vec4(xy, 0.0, 1.0);
        // Map vertex coordinates (-1 to +1) to UV coordinates (0 to 1).
        // UV coordinates are Y-flipped relative to vertex coordinates.
        uv = vec2((1.0 + xy.x) / 2.0, (1.0 - xy.y) / 2.0);
      }
    `),i(C,"fragmentShaderSource",`
      varying highp vec2 uv;

      uniform sampler2D texture;

      void main(void) {
        gl_FragColor = texture2D(texture, uv);
      }
    `);let G=C;const z=class z{constructor(e){y(this,V);y(this,A,null);y(this,L,null);y(this,M,null);y(this,D,null);y(this,x,null);y(this,U,null);y(this,O,null);S(this,A,e),S(this,M,J(this,V,Q).call(this))}async draw(e){if(await o(this,M),!o(this,L))throw Error("Context is null");if(!o(this,A))throw Error("Canvas is null");if(!o(this,x))throw Error("Device is null");if(!o(this,U))throw Error("Pipeline is null");o(this,A).width=e.displayWidth,o(this,A).height=e.displayHeight;const t=o(this,x).createBindGroup({layout:o(this,U).getBindGroupLayout(0),entries:[{binding:1,resource:o(this,O)},{binding:2,resource:o(this,x).importExternalTexture({source:e})}]}),r=o(this,x).createCommandEncoder(),n={colorAttachments:[{view:o(this,L).getCurrentTexture().createView(),clearValue:[1,0,0,1],loadOp:"clear",storeOp:"store"}]},a=r.beginRenderPass(n);a.setPipeline(o(this,U)),a.setBindGroup(0,t),a.draw(6,1,0,0),a.end(),o(this,x).queue.submit([r.finish()]),e.close()}};A=new WeakMap,L=new WeakMap,M=new WeakMap,D=new WeakMap,x=new WeakMap,U=new WeakMap,O=new WeakMap,V=new WeakSet,Q=async function(){const e=await navigator.gpu.requestAdapter();if(!e)throw Error("WebGPU Adapter is null");if(S(this,x,await e.requestDevice()),S(this,D,navigator.gpu.getPreferredCanvasFormat()),!o(this,A))throw Error("Canvas is null");if(S(this,L,o(this,A).getContext("webgpu")),!o(this,L))throw Error("Context is null");o(this,L).configure({device:o(this,x),format:o(this,D),alphaMode:"opaque"}),S(this,U,o(this,x).createRenderPipeline({layout:"auto",vertex:{module:o(this,x).createShaderModule({code:z.vertexShaderSource}),entryPoint:"vert_main"},fragment:{module:o(this,x).createShaderModule({code:z.fragmentShaderSource}),entryPoint:"frag_main",targets:[{format:o(this,D)}]},primitive:{topology:"triangle-list"}})),S(this,O,o(this,x).createSampler({}))},i(z,"vertexShaderSource",`
    struct VertexOutput {
      @builtin(position) Position: vec4<f32>,
      @location(0) uv: vec2<f32>,
    }

    @vertex
    fn vert_main(@builtin(vertex_index) VertexIndex: u32) -> VertexOutput {
      var pos = array<vec2<f32>, 6>(
        vec2<f32>( 1.0,  1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 1.0,  1.0),
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(-1.0,  1.0)
      );

      var uv = array<vec2<f32>, 6>(
        vec2<f32>(1.0, 0.0),
        vec2<f32>(1.0, 1.0),
        vec2<f32>(0.0, 1.0),
        vec2<f32>(1.0, 0.0),
        vec2<f32>(0.0, 1.0),
        vec2<f32>(0.0, 0.0)
      );

      var output : VertexOutput;
      output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
      output.uv = uv[VertexIndex];
      return output;
    }
  `),i(z,"fragmentShaderSource",`
    @group(0) @binding(1) var mySampler: sampler;
    @group(0) @binding(2) var myTexture: texture_external;

    @fragment
    fn frag_main(@location(0) uv : vec2<f32>) -> @location(0) vec4<f32> {
      return textureSampleBaseClampToEdge(myTexture, mySampler, uv);
    }
  `);let W=z;const rt=self;class it{constructor(e){i(this,"renderer",null);i(this,"videoPort",null);i(this,"pendingFrame",null);i(this,"startTime",null);i(this,"frameCount",0);i(this,"timestamp",0);i(this,"fps",0);i(this,"onVideoDecoderOutput",e=>{if(this.startTime==null)this.startTime=performance.now();else{const t=(performance.now()-this.startTime)/1e3;this.fps=++this.frameCount/t}this.renderFrame(e)});i(this,"renderFrame",e=>{this.pendingFrame?this.pendingFrame.close():requestAnimationFrame(this.renderAnimationFrame),this.pendingFrame=e});i(this,"renderAnimationFrame",()=>{var e;this.pendingFrame&&((e=this.renderer)==null||e.draw(this.pendingFrame),this.pendingFrame=null)});i(this,"onVideoDecoderOutputError",e=>{console.error("H264 Render worker decoder error",e)});i(this,"decoder",new VideoDecoder({output:this.onVideoDecoderOutput,error:this.onVideoDecoderOutputError}));i(this,"init",e=>{switch(e.renderer){case"webgl":this.renderer=new G(e.canvas);break;case"webgl2":this.renderer=new H(e.canvas);break;case"webgpu":this.renderer=new W(e.canvas);break}this.videoPort=e.videoPort,this.videoPort.onmessage=t=>{this.onFrame(t.data)},e.reportFps&&setInterval(()=>{this.decoder.state==="configured"&&console.debug(`FPS: ${this.fps}`)},5e3)});i(this,"onFrame",e=>{const t=new Uint8Array(e.frameData);if(this.decoder.state==="unconfigured"){const r=et(t);r&&(this.decoder.configure(r),console.log(r))}if(this.decoder.state==="configured")try{this.decoder.decode(new EncodedVideoChunk({type:tt(t)?"key":"delta",data:t,timestamp:this.timestamp++}))}catch(r){console.error("H264 Render Worker decode error",r)}});this.host=e}}const st=new it(self);rt.addEventListener("message",b=>{b.data.type==="init"&&st.init(b.data)})})();
