<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import ContactCard from '$lib/components/ContactCard.svelte';
</script>

<Seo
	title="Delivery Policy - ChowBenin"
	description="Learn about ChowBenin's food delivery service, delivery times, and coverage areas."
/>

<div class="prose prose-sm max-w-none">
	<h1 class="text-2xl font-extrabold">Delivery Policy</h1>
	<p class="text-text-muted text-sm">Last updated: December 2, 2025</p>

	<section class="mt-8 space-y-6">
		<div>
			<h2 class="text-lg font-bold">1. Service Area</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				ChowBenin currently provides food delivery services within Benin Republic. Delivery
				availability may vary based on your specific location and the restaurant's delivery range.
			</p>
		</div>

		<div>
			<h2 class="text-lg font-bold">2. Delivery Partners</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				Your order may be delivered by:
			</p>
			<ul class="text-text-body mt-2 list-disc space-y-2 pl-5 text-sm">
				<li>
					<strong>Restaurant Delivery:</strong> Some restaurants have their own delivery personnel and
					will deliver directly to you.
				</li>
				<li>
					<strong>ChowBenin Delivery:</strong> When restaurants don't have their own delivery, our team
					of bike riders will pick up and deliver your order.
				</li>
			</ul>
		</div>

		<div>
			<h2 class="text-lg font-bold">3. Delivery Times</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				Estimated delivery times are displayed when you place your order. These are estimates and
				actual delivery times may vary due to:
			</p>
			<ul class="text-text-body mt-2 list-disc space-y-1 pl-5 text-sm">
				<li>Traffic conditions</li>
				<li>Weather conditions</li>
				<li>Order volume at the restaurant</li>
				<li>Distance between the restaurant and your location</li>
				<li>Food preparation complexity</li>
			</ul>
			<p class="text-text-body mt-3 text-sm leading-relaxed">
				We will notify you if there are significant delays to your order.
			</p>
		</div>

		<div>
			<h2 class="text-lg font-bold">4. Delivery Fees</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				A delivery fee is charged for each order to cover the cost of delivery. The delivery fee
				may vary based on:
			</p>
			<ul class="text-text-body mt-2 list-disc space-y-1 pl-5 text-sm">
				<li>Distance from the restaurant to your delivery address</li>
				<li>Current demand and availability of delivery personnel</li>
			</ul>
			<p class="text-text-body mt-3 text-sm leading-relaxed">
				The exact delivery fee will be displayed at checkout before you complete your order.
			</p>
		</div>

		<div>
			<h2 class="text-lg font-bold">5. Delivery Instructions</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				When placing an order, please provide:
			</p>
			<ul class="text-text-body mt-2 list-disc space-y-1 pl-5 text-sm">
				<li>Accurate and complete delivery address</li>
				<li>Any landmarks or directions that may help locate your address</li>
				<li>A working phone number where you can be reached</li>
				<li>Special instructions (e.g., "Call when arriving", "Leave at door")</li>
			</ul>
		</div>

		<div>
			<h2 class="text-lg font-bold">6. Receiving Your Order</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				Please ensure you are available to receive your order at the delivery address:
			</p>
			<ul class="text-text-body mt-2 list-disc space-y-2 pl-5 text-sm">
				<li>
					<strong>Be Reachable:</strong> Keep your phone nearby. The delivery person may call if they
					have trouble finding your location.
				</li>
				<li>
					<strong>Verify Your Order:</strong> We recommend checking your order upon receipt to ensure
					all items are present and correct.
				</li>
				<li>
					<strong>Report Issues Promptly:</strong> If there are any problems with your order, report
					them within 2 hours. See our
					<a href="/legal/refund-policy" class="text-primary underline">Refund Policy</a>.
				</li>
			</ul>
		</div>

		<div>
			<h2 class="text-lg font-bold">7. Failed Deliveries</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				If a delivery cannot be completed because:
			</p>
			<ul class="text-text-body mt-2 list-disc space-y-1 pl-5 text-sm">
				<li>You provided an incorrect address</li>
				<li>You were unreachable or unavailable</li>
				<li>The delivery location was inaccessible</li>
			</ul>
			<p class="text-text-body mt-3 text-sm leading-relaxed">
				In these cases, you may not be eligible for a refund. We will attempt to contact you before
				marking a delivery as failed.
			</p>
		</div>

		<div>
			<h2 class="text-lg font-bold">8. Food Safety</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				We take food safety seriously:
			</p>
			<ul class="text-text-body mt-2 list-disc space-y-1 pl-5 text-sm">
				<li>Orders are packaged by restaurants to maintain food quality during transit</li>
				<li>Our delivery personnel handle food with care</li>
				<li>We recommend consuming your food promptly upon delivery</li>
			</ul>
		</div>

		<ContactCard title="9. Contact Us" />
	</section>
</div>
