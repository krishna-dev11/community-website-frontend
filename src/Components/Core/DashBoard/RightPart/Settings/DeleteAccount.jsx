import React, { useState } from 'react';
import { RiDeleteBin7Line } from "react-icons/ri";
import { useDispatch, useSelector } from 'react-redux';
import { DeleteAccountPermanentaly } from '../../../../../services/Operations/DashBoard';
import ConfirmationModal from '../../../../Common/ConfirmationModal';
import { useNavigate } from 'react-router-dom';

const DeleteAccount = () => {
  const [modal, setModal] = useState(null);
  const { user } = useSelector(state => state.profile);
  const { token } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <>
      <div className="ka-card p-6 md:p-8 border-red-500/20 bg-red-500/[0.02] flex flex-col sm:flex-row items-start gap-6">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500 shrink-0 shadow-sm">
          <RiDeleteBin7Line size={22} />
        </div>
        
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-red-500 tracking-tight">Danger Zone: Account Deletion</h3>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
            Terminating your account is irreversible. All linked profiles, community history, and applications will be permanently erased.
          </p>
          <button 
            type="button"
            onClick={() => setModal({
              heading: "Initiate Termination?",
              text1: "You are about to permanently delete your account profile.",
              button1Text: "Delete Account",
              button2Text: "Cancel",
              button1Handler: () => dispatch(DeleteAccountPermanentaly(token, user?._id || user?.id, navigate)),
              button2Handler: () => setModal(null)
            })}
            className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider transition-colors w-fit mt-1 underline cursor-pointer"
          >
            I understand, delete my account
          </button>
        </div>
      </div>
      {modal && <ConfirmationModal modalData={modal} />}
    </>
  );
};

export default DeleteAccount;