import { useStore } from '../../lib/store';
import { statusOf } from '../../lib/utils';
import Barcode from '../../components/Barcode';
import { Badge, Card, Notice, PageHeader } from '../../components/ui';

export default function MemberBarcode() {
  const { data, session } = useStore();
  const member = data.members.find((m) => m.id === session.memberId);
  if (!member) return <p className="text-muted">Data member tidak ditemukan.</p>;
  const status = statusOf(data.memberships, member.id);

  return (
    <>
      <PageHeader
        title="Barcode"
        subtitle="Tunjukkan barcode ini kepada Staff atau Owner untuk dipindai saat check-in."
      />
      <Card className="mx-auto max-w-md text-center">
        <p className="font-display text-3xl uppercase">{member.name}</p>
        <div className="mt-2 flex justify-center">
          <Badge status={status} />
        </div>
        <div className="mt-6 rounded-xl bg-white p-6">
          <Barcode value={member.code} height={110} />
        </div>
        {status !== 'active' && (
          <div className="mt-6">
            <Notice ok={false}>
              Membership {status === 'none' ? 'belum tersedia' : 'sudah kedaluwarsa'}. Check-in akan ditolak.
            </Notice>
          </div>
        )}
      </Card>
    </>
  );
}
