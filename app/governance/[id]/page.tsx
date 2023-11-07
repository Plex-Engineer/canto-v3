import Text from "@/components/text";

export default function Page({ params }: any) {
  return <Text>Proposal ID : {params.id}</Text>;
}
