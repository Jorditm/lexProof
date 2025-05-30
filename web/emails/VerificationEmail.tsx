import { Html } from "@react-email/html";
import { Text } from "@react-email/text";

const VerificationEmail = ({ name }: { name: string }) => (
  <Html>
    <Text>Hello {name}, please verify your email!</Text>
  </Html>
);
export default VerificationEmail;
