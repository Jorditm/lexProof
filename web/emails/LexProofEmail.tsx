import { Html } from "@react-email/html";
import { Head } from "@react-email/head";
import { Preview } from "@react-email/preview";
import { Body } from "@react-email/body";
import { Container } from "@react-email/container";
import { Section } from "@react-email/section";
import { Img } from "@react-email/img";
import { Text } from "@react-email/text";
import { Tailwind } from "@react-email/tailwind";

type LexproofTemplateProps = {
  body: string; // HTML string parsed from Tiptap
};

export const LexproofTemplate = ({ body }: LexproofTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Lexproof email</Preview>
      <Tailwind>
        <Body className="bg-white text-black font-sans">
          <Container className="mx-auto p-6 border border-gray-200 rounded">
            <Section>
              <div dangerouslySetInnerHTML={{ __html: body }} />
            </Section>
            <Section className="mt-10 text-center">
              <Text className="text-xs text-gray-400 mt-2">
                © Lexproof, todos los derechos reservados
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default LexproofTemplate;
